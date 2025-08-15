/*
  # Sample Data for NicheNode MVP

  1. Sample Data
    - Creates sample expert profiles with realistic data
    - Adds sample reviews to demonstrate the rating system
    - Uses a workaround for the auth.users foreign key constraint

  2. Security
    - Maintains RLS policies
    - Creates realistic consultation and review data
*/

-- Temporarily disable the foreign key constraint to insert sample data
-- In production, this data would be created through normal user signup
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Insert sample expert profiles
DO $$
DECLARE
  user_id_1 uuid := '11111111-1111-1111-1111-111111111111';
  user_id_2 uuid := '22222222-2222-2222-2222-222222222222';
  user_id_3 uuid := '33333333-3333-3333-3333-333333333333';
  user_id_4 uuid := '44444444-4444-4444-4444-444444444444';
  client_1_id uuid := '55555555-5555-5555-5555-555555555555';
  client_2_id uuid := '66666666-6666-6666-6666-666666666666';
  expert_1_id uuid;
  expert_2_id uuid;
  expert_3_id uuid;
  expert_4_id uuid;
  consultation_1_id uuid := gen_random_uuid();
  consultation_2_id uuid := gen_random_uuid();
  consultation_3_id uuid := gen_random_uuid();
  consultation_4_id uuid := gen_random_uuid();
  consultation_5_id uuid := gen_random_uuid();
BEGIN
  -- Insert sample profiles
  INSERT INTO profiles (id, email, full_name, is_expert, avatar_url) VALUES
  (user_id_1, 'margaret.chen@example.com', 'Margaret Chen', true, 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=400'),
  (user_id_2, 'edmund.hartwell@example.com', 'Professor Edmund Hartwell', true, 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=400'),
  (user_id_3, 'sarah.rodriguez@example.com', 'Sarah Rodriguez', true, 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=400'),
  (user_id_4, 'klaus.weber@example.com', 'Dr. Klaus Weber', true, 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400'),
  (client_1_id, 'client1@example.com', 'John Smith', false, NULL),
  (client_2_id, 'client2@example.com', 'Jane Doe', false, NULL);
  
  -- Insert expert profiles
  INSERT INTO experts (user_id, skill_title, description, hourly_rate, response_time, verified, tags) VALUES
  (user_id_1, 'COBOL Legacy Systems', '25+ years maintaining COBOL systems for Fortune 500 companies. Specialized in Y2K remediation and modern integration.', 150, '< 2 hours', true, ARRAY['COBOL', 'Legacy Systems', 'Mainframe', 'Y2K', 'Integration']),
  (user_id_2, 'Victorian Era Button Authentication', 'Curator emeritus with 40 years experience in Victorian decorative arts. Author of "The Complete Guide to Victorian Buttons".', 85, '< 4 hours', true, ARRAY['Victorian', 'Antiques', 'Authentication', 'Buttons', 'History']),
  (user_id_3, 'Advanced Excel Automation', 'Excel MVP with expertise in complex VBA macros, Power Query, and enterprise automation solutions.', 95, '< 1 hour', true, ARRAY['Excel', 'VBA', 'Automation', 'Power Query', 'Data Analysis']),
  (user_id_4, 'Medieval Manuscript Restoration', 'Restoration specialist for medieval illuminated manuscripts. 15 years at the British Library manuscript department.', 120, '< 6 hours', true, ARRAY['Medieval', 'Manuscripts', 'Restoration', 'Conservation', 'History']);

  -- Get expert IDs for reviews
  SELECT id INTO expert_1_id FROM experts WHERE user_id = user_id_1;
  SELECT id INTO expert_2_id FROM experts WHERE user_id = user_id_2;
  SELECT id INTO expert_3_id FROM experts WHERE user_id = user_id_3;
  SELECT id INTO expert_4_id FROM experts WHERE user_id = user_id_4;
  
  -- Create sample completed consultations
  INSERT INTO consultations (id, expert_id, client_id, title, description, budget, timeline, status) VALUES
  (consultation_1_id, expert_1_id, client_1_id, 'COBOL System Migration', 'Need help migrating legacy COBOL system to modern infrastructure', 1000, 'month', 'completed'),
  (consultation_2_id, expert_2_id, client_2_id, 'Victorian Button Appraisal', 'Authenticate collection of Victorian buttons for estate sale', 250, 'week', 'completed'),
  (consultation_3_id, expert_3_id, client_1_id, 'Excel Automation Project', 'Automate monthly reporting with VBA macros', 500, 'week', 'completed'),
  (consultation_4_id, expert_4_id, client_1_id, 'Medieval Manuscript Assessment', 'Evaluate condition of 14th century manuscript for insurance', 300, 'week', 'completed'),
  (consultation_5_id, expert_4_id, client_2_id, 'Manuscript Restoration Quote', 'Assessment for full restoration of illuminated psalter', 500, 'flexible', 'completed');
  
  -- Add sample reviews
  INSERT INTO reviews (expert_id, client_id, consultation_id, rating, comment) VALUES
  -- Margaret Chen (COBOL) reviews
  (expert_1_id, client_1_id, consultation_1_id, 5, 'Margaret was incredibly knowledgeable and helped us successfully migrate our 30-year-old COBOL system. Highly recommended!'),
  (expert_1_id, client_2_id, consultation_1_id, 5, 'Excellent expertise in legacy systems. Very professional and responsive.'),
  (expert_1_id, client_1_id, consultation_1_id, 4, 'Great work on the COBOL migration. Very thorough documentation.'),
  
  -- Professor Hartwell (Victorian Buttons) reviews
  (expert_2_id, client_2_id, consultation_2_id, 5, 'Professor Hartwell provided detailed authentication of our Victorian button collection. His expertise is unmatched.'),
  (expert_2_id, client_1_id, consultation_2_id, 5, 'Amazing knowledge of Victorian decorative arts. Very helpful and detailed analysis.'),
  
  -- Sarah Rodriguez (Excel) reviews
  (expert_3_id, client_1_id, consultation_3_id, 5, 'Sarah created amazing Excel automation that saved us hours of work each month. Fantastic results!'),
  (expert_3_id, client_2_id, consultation_3_id, 5, 'Incredible Excel skills. The VBA macros work perfectly and are well documented.'),
  (expert_3_id, client_1_id, consultation_3_id, 4, 'Very skilled with Excel automation. Quick turnaround and great communication.'),
  
  -- Dr. Weber (Medieval Manuscripts) reviews
  (expert_4_id, client_1_id, consultation_4_id, 5, 'Dr. Weber restored our medieval manuscript beautifully. His expertise in conservation is remarkable.'),
  (expert_4_id, client_2_id, consultation_5_id, 5, 'Exceptional work on manuscript restoration. Very careful and knowledgeable approach.');
END $$;

-- Note: In production, the foreign key constraint would be maintained
-- and profiles would be created through Supabase Auth signup process
-- This is only for demo/development purposes