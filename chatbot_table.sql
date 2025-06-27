-- Create the chatbot table
CREATE TABLE IF NOT EXISTS public.chatbot (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    chat_id TEXT NOT NULL,
    data_sources TEXT[] DEFAULT '{}',
    conversation_json JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chatbot_user_id ON public.chatbot(user_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_chat_id ON public.chatbot(chat_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_created_at ON public.chatbot(created_at);
CREATE INDEX IF NOT EXISTS idx_chatbot_user_chat ON public.chatbot(user_id, chat_id);

-- Create a composite index for efficient queries by user and chat
CREATE UNIQUE INDEX IF NOT EXISTS idx_chatbot_user_chat_unique ON public.chatbot(user_id, chat_id);

-- Create a function to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_chatbot_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at on row updates
DROP TRIGGER IF EXISTS trigger_update_chatbot_updated_at ON public.chatbot;
CREATE TRIGGER trigger_update_chatbot_updated_at
    BEFORE UPDATE ON public.chatbot
    FOR EACH ROW
    EXECUTE FUNCTION update_chatbot_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE public.chatbot ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Policy: Users can only see their own chat records
CREATE POLICY "Users can view their own chats" ON public.chatbot
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own chat records
CREATE POLICY "Users can insert their own chats" ON public.chatbot
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own chat records
CREATE POLICY "Users can update their own chats" ON public.chatbot
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own chat records
CREATE POLICY "Users can delete their own chats" ON public.chatbot
    FOR DELETE USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT ALL ON public.chatbot TO authenticated;
GRANT ALL ON public.chatbot TO service_role;

-- Add helpful comments
COMMENT ON TABLE public.chatbot IS 'Stores chat conversations between users and the DatrixAI agent';
COMMENT ON COLUMN public.chatbot.id IS 'Primary key - unique chat record identifier';
COMMENT ON COLUMN public.chatbot.user_id IS 'Foreign key to auth.users - identifies the user';
COMMENT ON COLUMN public.chatbot.chat_id IS 'Chat session identifier - groups messages in a conversation';
COMMENT ON COLUMN public.chatbot.data_sources IS 'Array of connected data sources used in this chat';
COMMENT ON COLUMN public.chatbot.conversation_json IS 'Full conversation log including messages, attachments, and metadata';
COMMENT ON COLUMN public.chatbot.created_at IS 'Timestamp when the chat record was created';
COMMENT ON COLUMN public.chatbot.updated_at IS 'Timestamp when the chat record was last updated'; 