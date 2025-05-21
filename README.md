# 🌳 MLM Binary Tree – Frontend

Frontend for an interactive MLM (Multi-Level Marketing) binary structure visualization system. Built using **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **shadcn/ui**, and **React D3 Tree** for dynamic tree visualization.

---

## ✨ Key Features

- **Binary Tree Structure**: Each member can have a maximum of 2 downlines.
- **Add Root Member**: Available when data is empty or no root member exists.
- **Node Interaction**:
  - Click a detail besides node to view details, edit, add downline, or delete.
  - Deletion can be performed for a single member or cascaded (including all downlines).
- **Collapse/Expand**: Click the circle on a node to open or close a subtree.
- **Search Functionality**:
  - Find members by name, email, or phone number.
  - Display search results information along with uplines and downlines.
  - Automatically highlight and center the view on the search result node.

---

## 🛠️ Technologies Used

- [Next.js 14](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [React D3 Tree](https://github.com/bkrem/react-d3-tree)
- [Vercel](https://vercel.com/) for deployment

---

## 🚀 Installation & Running the Project

### 1. Clone Repository

```bash
git clone https://github.com/your-username/mlm-binary.git
cd mlm-binary/apps/frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory and fill it with:

```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

Or copy from the example:

```bash
cp .env.example .env.local
```

### 4. Run Development Server

```bash
npm run dev
```

Access the application at: http://localhost:3000
