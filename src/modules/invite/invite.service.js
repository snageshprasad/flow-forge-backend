const { Resend } = require("resend");
const {
  Invite,
  Organization,
  OrganizationMember,
  User,
} = require("../../config/db");

const resend = new Resend(process.env.RESEND_API_KEY);

// ── Send Invite ──
const sendInvite = async (senderId, orgId, { email, role = "member" }) => {
  if (!email) {
    const error = new Error("Email is required");
    error.status = 400;
    throw error;
  }

  // check sender has permission
  const senderMembership = await OrganizationMember.findOne({
    where: { organization_id: orgId, user_id: senderId },
  });

  if (
    !senderMembership ||
    !["owner", "admin"].includes(senderMembership.role)
  ) {
    const error = new Error("You don't have permission to send invites");
    error.status = 403;
    throw error;
  }

  // check invitee exists
  const invitee = await User.findOne({ where: { email } });
  if (!invitee) {
    const error = new Error("No user found with this email");
    error.status = 404;
    throw error;
  }

  // check if already a member
  const existingMember = await OrganizationMember.findOne({
    where: { organization_id: orgId, user_id: invitee.id },
  });
  if (existingMember) {
    const error = new Error("User is already a member of this organization");
    error.status = 409;
    throw error;
  }

  // check if pending invite already exists
  const existingInvite = await Invite.findOne({
    where: { organization_id: orgId, email, status: "pending" },
  });
  if (existingInvite) {
    const error = new Error("A pending invite already exists for this email");
    error.status = 409;
    throw error;
  }

  const org = await Organization.findByPk(orgId);
  const sender = await User.findByPk(senderId, {
    attributes: ["name", "email"],
  });

  const invite = await Invite.create({
    organization_id: orgId,
    invited_by: senderId,
    email,
    role,
  });

  const inviteLink = `${process.env.CLIENT_URL}/invite/${invite.token}`;

  // send email
  await resend.emails.send({
    from: "FlowForge <onboarding@resend.dev>",
    to: email,
    subject: `${sender.name} invited you to join ${org.name} on FlowForge`,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="margin:0;padding:0;background:#0A0C10;font-family:'DM Sans',Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0C10;padding:40px 20px;">
            <tr>
              <td align="center">
                <table width="520" cellpadding="0" cellspacing="0" style="background:#0D1117;border:0.5px solid #1A1F2E;border-radius:12px;overflow:hidden;">
                  
                  <!-- header -->
                  <tr>
                    <td style="padding:28px 32px;border-bottom:0.5px solid #1A1F2E;">
                      <span style="color:#C8CCDF;font-size:18px;font-weight:700;letter-spacing:-0.02em;">
                        Flow<span style="color:#4B6EFF;">Forge</span>
                      </span>
                    </td>
                  </tr>

                  <!-- body -->
                  <tr>
                    <td style="padding:32px;">
                      <p style="color:#C8CCDF;font-size:22px;font-weight:700;margin:0 0 8px;letter-spacing:-0.02em;">
                        You've been invited
                      </p>
                      <p style="color:#3A4268;font-size:14px;margin:0 0 28px;line-height:1.6;">
                        <strong style="color:#7B85A8;">${sender.name}</strong> has invited you to join 
                        <strong style="color:#7B85A8;">${org.name}</strong> as a <strong style="color:#7B85A8;">${role}</strong>.
                      </p>

                      <a href="${inviteLink}" style="display:inline-block;background:#4B6EFF;color:#fff;font-size:14px;font-weight:600;padding:12px 28px;border-radius:8px;text-decoration:none;letter-spacing:0.01em;">
                        Accept Invite
                      </a>

                      <p style="color:#2E3860;font-size:12px;margin:24px 0 0;line-height:1.6;">
                        This invite expires in 7 days. If you didn't expect this, you can ignore this email.
                      </p>

                      <p style="color:#1E2440;font-size:11px;margin:16px 0 0;">
                        Or copy this link: <span style="color:#3A4268;">${inviteLink}</span>
                      </p>
                    </td>
                  </tr>

                  <!-- footer -->
                  <tr>
                    <td style="padding:16px 32px;border-top:0.5px solid #1A1F2E;">
                      <p style="color:#1E2440;font-size:11px;margin:0;">
                        © ${new Date().getFullYear()} FlowForge. All rights reserved.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  });

  return invite;
};

// ── Accept Invite ──
const acceptInvite = async (userId, token) => {
  const invite = await Invite.findOne({ where: { token } });

  if (!invite) {
    const error = new Error("Invalid invite token");
    error.status = 404;
    throw error;
  }

  if (invite.status !== "pending") {
    const error = new Error(`Invite has already been ${invite.status}`);
    error.status = 400;
    throw error;
  }

  if (new Date() > invite.expires_at) {
    await invite.update({ status: "expired" });
    const error = new Error("Invite has expired");
    error.status = 400;
    throw error;
  }

  // verify the logged in user matches the invite email
  const user = await User.findByPk(userId);
  if (user.email !== invite.email) {
    const error = new Error(
      "This invite was sent to a different email address",
    );
    error.status = 403;
    throw error;
  }

  // check not already a member
  const existingMember = await OrganizationMember.findOne({
    where: { organization_id: invite.organization_id, user_id: userId },
  });
  if (existingMember) {
    const error = new Error("You are already a member of this organization");
    error.status = 409;
    throw error;
  }

  // add to org
  await OrganizationMember.create({
    organization_id: invite.organization_id,
    user_id: userId,
    role: invite.role,
  });

  await invite.update({ status: "accepted", accepted_at: new Date() });

  return { organization_id: invite.organization_id, role: invite.role };
};

// ── Decline Invite ──
const declineInvite = async (userId, token) => {
  const invite = await Invite.findOne({ where: { token } });

  if (!invite) {
    const error = new Error("Invalid invite token");
    error.status = 404;
    throw error;
  }

  if (invite.status !== "pending") {
    const error = new Error(`Invite has already been ${invite.status}`);
    error.status = 400;
    throw error;
  }

  const user = await User.findByPk(userId);
  if (user.email !== invite.email) {
    const error = new Error(
      "This invite was sent to a different email address",
    );
    error.status = 403;
    throw error;
  }

  await invite.update({ status: "cancelled" });
};

// ── Get Invite By Token (for preview before accepting) ──
const getInviteByToken = async (token) => {
  const invite = await Invite.findOne({
    where: { token },
    include: [
      {
        model: Organization,
        as: "organization",
        attributes: ["id", "name", "logo_url"],
      },
      { model: User, as: "inviter", attributes: ["id", "name", "avatar_url"] },
    ],
  });

  if (!invite) {
    const error = new Error("Invalid invite token");
    error.status = 404;
    throw error;
  }

  return invite;
};

// ── Get My Pending Invites ──
const getMyInvites = async (userId) => {
  const user = await User.findByPk(userId);

  return await Invite.findAll({
    where: { email: user.email, status: "pending" },
    include: [
      {
        model: Organization,
        as: "organization",
        attributes: ["id", "name", "logo_url"],
      },
      { model: User, as: "inviter", attributes: ["id", "name", "avatar_url"] },
    ],
    order: [["created_at", "DESC"]],
  });
};

// ── Cancel Invite (by sender/admin) ──
const cancelInvite = async (userId, inviteId) => {
  const invite = await Invite.findByPk(inviteId);

  if (!invite) {
    const error = new Error("Invite not found");
    error.status = 404;
    throw error;
  }

  const membership = await OrganizationMember.findOne({
    where: { organization_id: invite.organization_id, user_id: userId },
  });

  if (!membership || !["owner", "admin"].includes(membership.role)) {
    const error = new Error("You don't have permission to cancel this invite");
    error.status = 403;
    throw error;
  }

  if (invite.status !== "pending") {
    const error = new Error("Only pending invites can be cancelled");
    error.status = 400;
    throw error;
  }

  await invite.update({ status: "cancelled" });
};

// ── Get Org Invites (admin view) ──
const getOrgInvites = async (userId, orgId) => {
  const membership = await OrganizationMember.findOne({
    where: { organization_id: orgId, user_id: userId },
  });

  if (!membership || !["owner", "admin"].includes(membership.role)) {
    const error = new Error("You don't have permission to view invites");
    error.status = 403;
    throw error;
  }

  return await Invite.findAll({
    where: { organization_id: orgId },
    include: [
      { model: User, as: "inviter", attributes: ["id", "name", "avatar_url"] },
    ],
    order: [["created_at", "DESC"]],
  });
};

module.exports = {
  sendInvite,
  acceptInvite,
  declineInvite,
  getInviteByToken,
  getMyInvites,
  cancelInvite,
  getOrgInvites,
};
