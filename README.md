# FlowForge Backend

> REST API for FlowForge — a team task management platform with organizations, boards, kanban-style task tracking, threaded comments, and role-based access control.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| ORM | Sequelize |
| Database | MySQL |
| Auth | JWT |

---

## Features

- **Organizations** — create and manage organizations, invite members via email tokens
- **Role-based access** — org-level roles (`owner`, `admin`, `member`, `viewer`) and board-level roles
- **Boards** — kanban boards scoped to an organization with member-level access control
- **Statuses** — ordered, customizable status columns per board with terminal state support
- **Tasks** — full task lifecycle with priority, due dates, drag-and-drop position, and soft delete
- **Assignees** — assign multiple members to a task
- **Threaded comments** — nested comment threads on tasks with soft delete
- **Activity log** — full audit trail of all actions per board/task
- **Invites** — token-based email invite system with expiry and status tracking
- **Soft delete** — paranoid mode on core models (User, Organization, Board, Task, Comment)

---

## Project Structure

```
flow-forge-backend/
├── config/
│   └── database.js          # Sequelize instance + dynamic model loader
├── models/
│   ├── user.model.js
│   ├── organization.model.js
│   ├── organization-member.model.js
│   ├── board.model.js
│   ├── board-member.model.js
│   ├── status.model.js
│   ├── task.model.js
│   ├── task-assignees.model.js
│   ├── comment.model.js
│   ├── activity.model.js
│   └── invite.model.js
├── routes/
├── controllers/
├── middlewares/
├── utils/
├── .env.example
├── .gitignore
└── server.js
```

---

## Data Model Overview

```
Organization
  ├── OrganizationMember (users + org roles)
  ├── Invite (token-based email invites)
  └── Board
        ├── BoardMember (users + board roles)
        ├── Status (ordered columns)
        └── Task
              ├── TaskAssignee
              ├── Comment (threaded)
              └── Activity (audit log)
```

---

## Getting Started

### Prerequisites

- Node.js >= 18
- MySQL >= 8

### Installation

```bash
git clone https://github.com/your-username/flow-forge-backend.git
cd flow-forge-backend
npm install
```

### Environment Setup

```bash
cp .env.example .env
```

Fill in your `.env`:

```env
PORT=5000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=flowforge
DB_USER=root
DB_PASSWORD=your_password

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
```

### Run

```bash
# development
npm run dev

# production
npm start
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Server port (default: 5000) |
| `DB_HOST` | Yes | MySQL host |
| `DB_PORT` | No | MySQL port (default: 3306) |
| `DB_NAME` | Yes | Database name |
| `DB_USER` | Yes | Database user |
| `DB_PASSWORD` | Yes | Database password |
| `JWT_SECRET` | Yes | Secret for signing JWTs |
| `JWT_EXPIRES_IN` | No | JWT expiry (default: 7d) |

---

## API Overview

| Resource | Base Path |
|---|---|
| Auth | `/api/auth` |
| Users | `/api/users` |
| Organizations | `/api/organizations` |
| Boards | `/api/boards` |
| Statuses | `/api/statuses` |
| Tasks | `/api/tasks` |
| Comments | `/api/comments` |
| Invites | `/api/invites` |
| Activity | `/api/activity` |

> Full API documentation coming soon.

---

## Roles & Permissions

### Organization Roles

| Role | Description |
|---|---|
| `owner` | Full control, can delete org |
| `admin` | Manage members, boards, tasks |
| `member` | Create and manage own tasks |
| `viewer` | Read-only access |

### Board Roles

Board roles can override org roles for specific boards.

| Role | Description |
|---|---|
| `admin` | Manage board, statuses, members |
| `member` | Create and manage tasks |
| `viewer` | Read-only access |

---

## License

MIT
