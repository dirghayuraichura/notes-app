# Smart Notes App

A modern note-taking application built with Next.js that features real-time collaboration, AI-powered category suggestions, and a beautiful UI.

## Features

- ✍️ Create and manage notes with rich text content
- 🤖 AI-powered category suggestions using ChatGPT
- 👥 Real-time collaboration with other users
- 🎨 Modern and responsive UI using Tailwind CSS
- 🔒 Secure authentication system

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- OpenAI API
- Socket.IO for real-time features
- Supabase for authentication and database

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/notes-app.git
cd notes-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with the following variables:
```
NEXT_PUBLIC_APP_URL=http://localhost:3000
OPENAI_API_KEY=your_openai_api_key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables

- `NEXT_PUBLIC_APP_URL`: Your app's URL (default: http://localhost:3000)
- `OPENAI_API_KEY`: Your OpenAI API key for category suggestions

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
