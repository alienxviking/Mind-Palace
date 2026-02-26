# 🧠 Mind Palace OS

> **Knowledge Visualization Operating System**  
> *Architect your thoughts in a 3D neural grid powered by AI.*

Mind Palace OS is a next-generation knowledge management tool that transforms static notes into a dynamic, 3D spatial environment. Built with **Next.js**, **Three.js**, and **Supabase**, it leverages **Google Gemini AI** to automatically synthesize, tag, and link your ideas into a cohesive neural network.

---

## ✨ Core Features

### 🌌 3D Spatial Visualization
Visualize your knowledge as a galaxy of interconnected "planets" (nodes). Navigate through your thoughts using intuitive 3D controls.
- **Dynamic Planets**: Each node is represented as a unique celestial body.
- **Neural Edges**: Connections between ideas are visualized as glowing bridges.
- **Physics-Driven**: Drag and reposition nodes to structure your palace spatially.

### 🤖 AI-Powered Architect
Integrate with Google Gemini AI to automate the organization of your mind.
- **Auto-Summarization**: AI generates concise summaries for every node you create.
- **Smart Tagging**: Automatic extraction of relevant tags for better searchability.
- **Neural Linking**: The AI suggests connections between seemingly unrelated ideas.

### 📟 Palace Terminal
Manage your mind palace through a retro-futuristic command-line interface.
- `create <title>`: Materialize a new node instantly.
- `connect <node1> <node2>`: Establish a neural link manually.
- `find <query>`: Locate and lock onto specific nodes in 3D space.
- `list`: Inventory all active nodes in your palace.

### 🌊 Deep Dive
Step inside a specific node for an immersive, focused environment. Perfect for long-form writing or complex analysis without distractions.

---

## 🛠️ Tech Stack

- **Frontend**: [Next.js](https://nextjs.org/) (React), [Tailwind CSS](https://tailwindcss.com/)
- **3D Engine**: [Three.js](https://threejs.org/) via [@react-three/fiber](https://r3f.docs.pmnd.rs/)
- **Backend/DB**: [Supabase](https://supabase.com/) (PostgreSQL + RLS)
- **Intelligence**: [Google Gemini AI API](https://ai.google.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/), [GSAP](https://gsap.com/)

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- A Supabase account and project
- A Google AI Studio API Key (for Gemini)

### 2. Installation
```bash
git clone https://github.com/your-username/mind-palace-os.git
cd mind-palace-os
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

### 4. Database Schema
Execute the contents of `db_setup.sql` in your Supabase SQL Editor to initialize the `nodes` and `edges` tables with Row Level Security.

### 5. Run Locally
```bash
npm run dev
```
Navigate to `http://localhost:3000` to enter your palace.

---

## 🎮 Navigation Controls

- **Left Click + Drag**: Pan the camera
- **Right Click + Drag**: Rotate view
- **Scroll**: Zoom in/out
- **[ESC]**: Reset camera/close UI
- **[ENTER]**: Access Terminal (inside palace)

---

## 📜 License
This project is licensed under the MIT License - see the LICENSE file for details.

---

*Built with ❤️ for thinkers, architects, and dreamers.*
