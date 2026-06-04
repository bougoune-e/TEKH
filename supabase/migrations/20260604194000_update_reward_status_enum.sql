-- Update reward_status check constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_reward_status_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_reward_status_check 
    CHECK (reward_status IN ('none', 'eligible_reward', 'reward_claimed'));

-- Update existing data if any
UPDATE profiles SET reward_status = 'eligible_reward' WHERE reward_status = 'eligible';
UPDATE profiles SET reward_status = 'reward_claimed' WHERE reward_status = 'claimed';
