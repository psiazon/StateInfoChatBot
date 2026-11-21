# Conversation memory in StateInfoChatBot

The UI sends `{ "message": "...", "thread_id": "<uuid>" }` to `VITE_AGENT_API_URL`. A single thread ID is reused for follow-up messages and stored in browser `sessionStorage` across refreshes of the same tab. The visible message list is also saved in sessionStorage. **New conversation** clears the visible history and creates a new thread ID; pending requests are aborted/ignored.

## Backend requirements

StateInfoAgent must accept `thread_id` in its request schema and pass it to LangGraph using `config={"configurable": {"thread_id": request.thread_id}}`. A configured LangGraph checkpointer is required to actually remember messages. Browser storage alone does not create LLM memory. An in-memory checkpointer will lose state on app restart or when requests hit another instance. Use durable checkpoint storage for production. Enforce authentication and conversation ownership server-side; thread IDs are not authorization tokens.

## Run

1. Set `VITE_AGENT_API_URL` in `.env.local` (or during the Vite production build).
2. Run `npm install` and `npm run dev`.
3. Ask: “What is the capital of Illinois?” then “What is its population?”
4. Inspect the browser Network tab to verify the same `thread_id` is sent both times. Refresh the page to confirm the UI history is retained.
5. Click **New conversation** and verify a new `thread_id` is sent.

The relative `/api/agent/chat` fallback requires a proxy. Configure CORS on StateInfoAgent for the frontend origin when using an absolute URL.
