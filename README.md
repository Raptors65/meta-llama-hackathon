![image](https://github.com/user-attachments/assets/ed7c590f-124a-42b9-9f58-9e94e93f326e)

# BrainTrainr

Imagine you want to start learning about a very big topic, like AI. How do you even begin learning about something that encompasses so many things?
Our app, BrainTrainr, aims to make this easier by breaking big questions or documents into smaller parts and displaying them visually as a 2D or 3D mindmap.

## Tech Stack

- [Llama 3.2 90B](https://huggingface.co/meta-llama/Llama-3.2-90B-Vision) for generating mindmap data
- [Next.js](https://nextjs.org/) and [Tailwind](https://tailwindcss.com/) for the frontend
- [Flask](https://flask.palletsprojects.com/en/stable/) for the backend

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone [repository-url]
   cd [repository-name]
   ```

2. Install dependencies:
   ```
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file in the frontend folder with your API keys:
   ```
   cd frontend
   touch .env.local
   ```
   
   Add the following to your `.env.local` file:
   ```
   NEBIUS_API_KEY=<replace this>
   AUTH0_SECRET=<replace this>
   AUTH0_BASE_URL=<replace this>
   AUTH0_ISSUER_BASE_URL=<replace this>
   AUTH0_CLIENT_ID=<replace this>
   AUTH0_CLIENT_SECRET=<replace this>
   NEXT_PUBLIC_SUPABASE_URL=<replace this>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<replace this>
   ```

4. Start the development server:
   ```
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser and navigate to `http://localhost:3000`
