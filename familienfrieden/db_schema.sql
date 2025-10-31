-- ============================================
-- FamilyManager App - Supabase Database Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CORE TABLES
-- ============================================

-- Users (erweitert Supabase auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    date_of_birth DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Households (Haushalte)
CREATE TABLE households (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    avatar_url TEXT,
    created_by UUID REFERENCES profiles(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Household Members mit Rollen
CREATE TABLE household_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID REFERENCES households(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('parent', 'child', 'guardian')),
    nickname TEXT, -- z.B. "Mama", "Papa", "Max"
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(household_id, user_id)
);

-- Family Connections (für Patchwork)
CREATE TABLE family_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_1_id UUID REFERENCES households(id) ON DELETE CASCADE NOT NULL,
    household_2_id UUID REFERENCES households(id) ON DELETE CASCADE NOT NULL,
    connection_type TEXT NOT NULL CHECK (connection_type IN ('shared_child', 'shared_calendar', 'co_parenting')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(household_1_id, household_2_id, connection_type)
);

-- ============================================
-- CALENDAR
-- ============================================

CREATE TABLE calendar_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID REFERENCES households(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    location TEXT,
    is_all_day BOOLEAN DEFAULT FALSE,
    recurrence_rule TEXT, -- RRULE format (z.B. "FREQ=WEEKLY;BYDAY=MO,WE,FR")
    category TEXT, -- "school", "sport", "medical", "leisure"
    color TEXT, -- Hex color code
    created_by UUID REFERENCES profiles(id) NOT NULL,
    assigned_to UUID REFERENCES profiles(id), -- Wem ist der Termin zugeordnet?
    is_shared BOOLEAN DEFAULT FALSE, -- Mit verbundenen Households teilen?
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event Reminders
CREATE TABLE event_reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES calendar_events(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    remind_at TIMESTAMPTZ NOT NULL,
    is_sent BOOLEAN DEFAULT FALSE
);

-- ============================================
-- TASKS & CREDITS
-- ============================================

CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID REFERENCES households(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT, -- "chores", "homework", "room_cleaning"
    difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    credit_value INTEGER NOT NULL CHECK (credit_value >= 0),
    assigned_to UUID REFERENCES profiles(id) NOT NULL,
    created_by UUID REFERENCES profiles(id) NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'pending_approval', 'completed', 'rejected')),
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    approved_by UUID REFERENCES profiles(id),
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    requires_photo BOOLEAN DEFAULT FALSE,
    photo_url TEXT,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_rule TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Credit Accounts (pro Child pro Household)
CREATE TABLE credit_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID REFERENCES households(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    balance INTEGER DEFAULT 0 NOT NULL,
    total_earned INTEGER DEFAULT 0 NOT NULL,
    total_spent INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(household_id, user_id)
);

-- Credit Transactions (History)
CREATE TABLE credit_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID REFERENCES credit_accounts(id) ON DELETE CASCADE NOT NULL,
    amount INTEGER NOT NULL, -- Positiv = Earned, Negativ = Spent
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('task_completed', 'screentime_redeemed', 'bonus', 'penalty', 'manual_adjustment')),
    task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    description TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SCREENTIME MANAGEMENT
-- ============================================

CREATE TABLE screentime_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID REFERENCES households(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    credits_per_minute INTEGER DEFAULT 1 NOT NULL, -- Wie viele Credits = 1 Minute?
    weekly_base_allowance INTEGER DEFAULT 0, -- Basis-Minuten pro Woche unabhängig von Credits
    max_daily_minutes INTEGER, -- Limit auch wenn Credits vorhanden
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(household_id, user_id)
);

CREATE TABLE screentime_redemptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID REFERENCES credit_accounts(id) ON DELETE CASCADE NOT NULL,
    credits_spent INTEGER NOT NULL,
    minutes_granted INTEGER NOT NULL,
    redeemed_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ -- Optional: Bildschirmzeit verfällt
);

-- ============================================
-- SHOPPING & MEAL PLANNING
-- ============================================

CREATE TABLE shopping_lists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID REFERENCES households(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL DEFAULT 'Einkaufsliste',
    category TEXT, -- "grocery", "pharmacy", "hardware"
    created_by UUID REFERENCES profiles(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE shopping_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    list_id UUID REFERENCES shopping_lists(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    quantity TEXT,
    category TEXT, -- "produce", "dairy", "meat"
    is_checked BOOLEAN DEFAULT FALSE,
    checked_by UUID REFERENCES profiles(id),
    checked_at TIMESTAMPTZ,
    added_by UUID REFERENCES profiles(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE meal_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID REFERENCES households(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
    title TEXT NOT NULL,
    description TEXT,
    recipe_url TEXT,
    created_by UUID REFERENCES profiles(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(household_id, date, meal_type)
);

-- ============================================
-- COMMUNICATION
-- ============================================

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID REFERENCES households(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    is_pinned BOOLEAN DEFAULT FALSE,
    pinned_by UUID REFERENCES profiles(id),
    pinned_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE message_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL, -- "image", "video", "document"
    file_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- NOTIFICATIONS
-- ============================================

CREATE TABLE push_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    token TEXT NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN ('ios', 'android')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, token)
);

-- ============================================
-- INDEXES for Performance
-- ============================================

CREATE INDEX idx_household_members_household ON household_members(household_id);
CREATE INDEX idx_household_members_user ON household_members(user_id);
CREATE INDEX idx_calendar_events_household ON calendar_events(household_id);
CREATE INDEX idx_calendar_events_start_time ON calendar_events(start_time);
CREATE INDEX idx_tasks_household ON tasks(household_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_credit_accounts_user ON credit_accounts(user_id);
CREATE INDEX idx_messages_household ON messages(household_id);
CREATE INDEX idx_shopping_items_list ON shopping_items(list_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE screentime_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE screentime_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

-- Profiles: User kann nur eigenes Profil sehen und bearbeiten
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Household Members: User sieht nur Households, in denen er Mitglied ist
CREATE POLICY "Users can view their household memberships"
ON household_members FOR SELECT
USING (
    user_id = auth.uid() OR
    household_id IN (
        SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
);

-- Households: User sieht nur Households, in denen er Mitglied ist
CREATE POLICY "Users can view their households"
ON households FOR SELECT
USING (
    id IN (
        SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
);

-- Calendar Events: User sieht nur Events seines Households
CREATE POLICY "Users can view household calendar events"
ON calendar_events FOR SELECT
USING (
    household_id IN (
        SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can create calendar events"
ON calendar_events FOR INSERT
WITH CHECK (
    household_id IN (
        SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
);

-- Tasks: User sieht nur Tasks seines Households
CREATE POLICY "Users can view household tasks"
ON tasks FOR SELECT
USING (
    household_id IN (
        SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Parents can create tasks"
ON tasks FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM household_members
        WHERE household_id = tasks.household_id
        AND user_id = auth.uid()
        AND role IN ('parent', 'guardian')
    )
);

CREATE POLICY "Parents can approve tasks"
ON tasks FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM household_members
        WHERE household_id = tasks.household_id
        AND user_id = auth.uid()
        AND role IN ('parent', 'guardian')
    )
);

CREATE POLICY "Children can update their own tasks"
ON tasks FOR UPDATE
USING (
    assigned_to = auth.uid() AND
    status IN ('open', 'in_progress')
);

-- Credit Accounts: User sieht nur eigene Accounts
CREATE POLICY "Users can view own credit accounts"
ON credit_accounts FOR SELECT
USING (
    user_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM household_members
        WHERE household_id = credit_accounts.household_id
        AND user_id = auth.uid()
        AND role IN ('parent', 'guardian')
    )
);

-- Shopping Lists: Alle Household-Mitglieder können sehen und bearbeiten
CREATE POLICY "Household members can view shopping lists"
ON shopping_lists FOR SELECT
USING (
    household_id IN (
        SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Household members can manage shopping items"
ON shopping_items FOR ALL
USING (
    list_id IN (
        SELECT id FROM shopping_lists WHERE household_id IN (
            SELECT household_id FROM household_members WHERE user_id = auth.uid()
        )
    )
);

-- Messages: Alle Household-Mitglieder können sehen
CREATE POLICY "Household members can view messages"
ON messages FOR SELECT
USING (
    household_id IN (
        SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Household members can send messages"
ON messages FOR INSERT
WITH CHECK (
    sender_id = auth.uid() AND
    household_id IN (
        SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Automatisch updated_at aktualisieren
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger für alle Tabellen mit updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_households_updated_at BEFORE UPDATE ON households
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON calendar_events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_credit_accounts_updated_at BEFORE UPDATE ON credit_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function: Credit Account automatisch erstellen wenn Kind zu Household hinzugefügt wird
CREATE OR REPLACE FUNCTION create_credit_account_for_child()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.role = 'child' THEN
        INSERT INTO credit_accounts (household_id, user_id, balance, total_earned, total_spent)
        VALUES (NEW.household_id, NEW.user_id, 0, 0, 0)
        ON CONFLICT (household_id, user_id) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_credit_account_trigger
AFTER INSERT ON household_members
FOR EACH ROW EXECUTE FUNCTION create_credit_account_for_child();

-- Function: Credit Account aktualisieren nach Task Completion
CREATE OR REPLACE FUNCTION update_credit_account_on_task_approval()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status = 'pending_approval' THEN
        -- Credits zum Account hinzufügen
        UPDATE credit_accounts
        SET 
            balance = balance + NEW.credit_value,
            total_earned = total_earned + NEW.credit_value,
            updated_at = NOW()
        WHERE household_id = NEW.household_id
        AND user_id = NEW.assigned_to;
        
        -- Transaction History erstellen
        INSERT INTO credit_transactions (
            account_id,
            amount,
            transaction_type,
            task_id,
            description,
            created_by
        )
        SELECT 
            id,
            NEW.credit_value,
            'task_completed',
            NEW.id,
            'Task completed: ' || NEW.title,
            NEW.approved_by
        FROM credit_accounts
        WHERE household_id = NEW.household_id
        AND user_id = NEW.assigned_to;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_credits_on_task_approval
AFTER UPDATE ON tasks
FOR EACH ROW
WHEN (NEW.status = 'completed' AND OLD.status = 'pending_approval')
EXECUTE FUNCTION update_credit_account_on_task_approval();

-- Function: Credits abziehen bei Screentime Redemption
CREATE OR REPLACE FUNCTION deduct_credits_on_screentime_redemption()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE credit_accounts
    SET 
        balance = balance - NEW.credits_spent,
        total_spent = total_spent + NEW.credits_spent,
        updated_at = NOW()
    WHERE id = NEW.account_id;
    
    -- Transaction History
    INSERT INTO credit_transactions (
        account_id,
        amount,
        transaction_type,
        description
    )
    VALUES (
        NEW.account_id,
        -NEW.credits_spent,
        'screentime_redeemed',
        'Redeemed ' || NEW.minutes_granted || ' minutes of screen time'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER deduct_credits_trigger
AFTER INSERT ON screentime_redemptions
FOR EACH ROW EXECUTE FUNCTION deduct_credits_on_screentime_redemption();