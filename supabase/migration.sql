-- ============================================================
-- KiraPrep Migration
-- Run this in the Supabase SQL Editor
-- ============================================================

-- ------------------------------------------------------------
-- 1. TABLES
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS schools (
  school_id   TEXT    PRIMARY KEY,
  display_name TEXT   NOT NULL,
  slug         TEXT   NOT NULL,
  batch_size   INT    NOT NULL,
  prep_sec     INT    NOT NULL,
  answer_sec   INT    NOT NULL,
  active       BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS questions (
  id          INT  PRIMARY KEY,
  school_id   TEXT NOT NULL REFERENCES schools(school_id),
  text        TEXT NOT NULL,
  category    TEXT NOT NULL,
  year        INT  NOT NULL,
  source      TEXT,
  source_url  TEXT,
  status      TEXT NOT NULL DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS practice_activities (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id  INT         NOT NULL REFERENCES questions(id),
  school_id    TEXT        NOT NULL,
  practiced_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 2. ROW LEVEL SECURITY
-- ------------------------------------------------------------

ALTER TABLE schools            ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions          ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_activities ENABLE ROW LEVEL SECURITY;

-- Schools and questions are publicly readable (no auth required)
CREATE POLICY "schools_public_read"
  ON schools FOR SELECT USING (true);

CREATE POLICY "questions_public_read"
  ON questions FOR SELECT USING (true);

-- Users can only access their own practice activity rows
CREATE POLICY "practice_activities_select"
  ON practice_activities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "practice_activities_insert"
  ON practice_activities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "practice_activities_delete"
  ON practice_activities FOR DELETE
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------
-- 3. SEED: schools
-- ------------------------------------------------------------

INSERT INTO schools (school_id, display_name, slug, batch_size, prep_sec, answer_sec, active) VALUES
  ('insead',      'INSEAD',      'insead-kira-questions',       4, 30, 90,  true),
  ('oxford-said', 'Oxford Said', 'oxford-said-kira-questions',  4, 30, 90,  true),
  ('foster',      'Foster',      'foster-kira-questions',       2, 30, 90,  true),
  ('iese',        'IESE',        'iese-kira-questions',         4, 60, 90,  true),
  ('kellogg',     'Kellogg',     'kellogg-kira-questions',      3, 60, 90,  true),
  ('mit',         'MIT Sloan',   'mit-sloan-kira-questions',    1, 10, 60,  true),
  ('yale',        'Yale SOM',    'yale-som-kira-questions',     3, 30, 90,  true),
  ('haas',        'Haas',        'haas-kira-questions',         5, 45, 180, true),
  ('mccombs',     'McCombs',     'mccombs-kira-questions',      5, 30, 180, true),
  ('lbs',         'LBS',         'lbs-kira-questions',          2, 45, 90,  true)
ON CONFLICT (school_id) DO NOTHING;

-- ------------------------------------------------------------
-- 4. SEED: questions
-- ------------------------------------------------------------

INSERT INTO questions (id, school_id, text, category, year, source, source_url, status) VALUES
  (1,  'insead', 'What is something you are incredibly passionate about? Can you share the story of how you discovered this passion and why it means so much to you?', 'Motivation & Vision', 2025, 'reddit', '', 'active'),
  (2,  'insead', 'Tell us about the last time you got upset at work. How did you deal with your anger?', 'Behavioral / Leadership / Collaboration', 2025, 'reddit', '', 'active'),
  (3,  'insead', 'Someone tells you what you are doing is culturally inappropriate in that person''s culture - what would you answer?', 'Behavioral / Leadership / Collaboration', 2025, 'reddit', '', 'active'),
  (4,  'insead', 'What are your criteria for selecting business schools?', 'Motivation & Vision', 2025, 'reddit', '', 'active'),
  (5,  'insead', 'How will you gain the trust of your subordinates as a new manager?', 'Behavioral / Leadership / Collaboration', 2025, 'reddit', '', 'active'),
  (6,  'insead', 'Tell us about a time when you interacted with someone who had a strong accent or didn''t speak your language', 'Behavioral / Leadership / Collaboration', 2025, 'reddit', '', 'active'),
  (7,  'insead', 'If someone was visiting your country for the first time, what advice would you give them?', 'Behavioral / Leadership / Collaboration', 2025, 'reddit', '', 'active'),
  (8,  'insead', 'Tell us about when you learnt a new culture, does that make you less or more connected with your own culture? Give us a detailed example', 'Behavioral / Leadership / Collaboration', 2025, 'reddit', '', 'active'),
  (9,  'insead', 'Many businesses aim at maximising values for shareholders. Is that enough or do you think they should also have other priorities?', 'Integrity', 2025, 'reddit', '', 'active'),
  (10, 'insead', 'What are the skills that you want to work on if you are to study at INSEAD?', 'Motivation & Vision', 2025, 'reddit', '', 'active'),
  (11, 'insead', 'How diversity is dealt with in your workplace?', 'Behavioral / Leadership / Collaboration', 2025, 'reddit', '', 'active'),
  (12, 'insead', 'What are the challenging goals you have set for yourself during your career?', 'Motivation & Vision', 2025, 'reddit', '', 'active'),
  (13, 'insead', 'How would your colleagues describe your leadership style?', 'Behavioral / Leadership / Collaboration', 2025, 'reddit', '', 'active'),
  (14, 'insead', 'If someone comes to you with a problem, what will you do?', 'Behavioral / Leadership / Collaboration', 2025, 'reddit', '', 'active'),
  (15, 'insead', 'In the event of team underperformance, how do you plan to address the situation?', 'General', 2025, 'reddit', '', 'active'),
  (16, 'insead', 'Is there a particular manager you admire? If so, what qualities inspire your admiration?', 'General', 2025, 'reddit', '', 'active'),
  (17, 'insead', 'Could you recount a scenario where you effectively collaborated with someone holding contrasting views?', 'General', 2025, 'reddit', '', 'active'),
  (18, 'insead', 'Describe a recent instance where a clash of cultural norms resulted in conflict.', 'General', 2025, 'reddit', '', 'active'),
  (19, 'oxford-said', 'Give me an example of taking a risk at work, and tell me how you approached the decision to go ahead', 'Behavioral / Leadership / Collaboration', 2025, 'reddit', '', 'active'),
  (20, 'oxford-said', 'What was the time horizon for planning in your most recent role? Tell me how you put together longer-term plans that could be implemented in the day to day', 'Behavioral / Leadership / Collaboration', 2025, 'reddit', '', 'active'),
  (21, 'oxford-said', 'Tell me about a situation where you supported a colleague outside of your work area to meet their objectives or deadlines, how did you go about it?', 'Behavioral / Leadership / Collaboration', 2025, 'reddit', '', 'active'),
  (22, 'oxford-said', 'Tell me whether you think someone can be a good manager without being a good leader? What''s the difference?', 'Behavioral / Leadership / Collaboration', 2025, 'reddit', '', 'active'),
  (23, 'foster', 'Tell me about a time when you encountered a situation with considerable ambiguity. What actions did you take, and what was the result? (2025)', 'Critical Thinking / Problem Solving', 2025, 'reddit', '', 'active'),
  (24, 'foster', 'Describe a time that you were able to make a big impact while being a member, not the leader, of a team. What did you find most rewarding about this experience? (2025)', 'Behavioral / Leadership / Collaboration', 2025, 'reddit', '', 'active'),
  (25, 'foster', 'Share an example of a time when you were given new information that affected a decision you had already made. How did you proceed?', 'Critical Thinking / Problem Solving', 2025, 'reddit', '', 'active'),
  (26, 'foster', 'Tell us about a time when you handled a task for which you had zero information. What was your strategy and what were the results?', 'Critical Thinking / Problem Solving', 2025, 'reddit', '', 'active'),
  (27, 'iese', 'How to pronounce your name?', 'Introduction / Self-Awareness', 2025, 'reddit', '', 'active'),
  (28, 'iese', 'Give us an introduction about yourself. What are your unique attributes and capabilities?', 'Introduction / Self-Awareness', 2025, 'reddit', '', 'active'),
  (29, 'iese', 'Give a background of yourself and what abilities you can bring to the IESE MBA', 'Motivation & Vision', 2025, 'reddit', '', 'active'),
  (30, 'iese', 'Tell us something about you that isn''t in your resume', 'Introduction / Self-Awareness', 2025, 'reddit', '', 'active'),
  (31, 'iese', 'What''s a time you received a critique at work that you didn''t agree with?', 'Introduction / Self-Awareness', 2025, 'reddit', '', 'active'),
  (32, 'iese', 'Tell us about a time you created an impact at work. What did you learn from it?', 'Behavioral / Leadership / Collaboration', 2025, 'reddit', '', 'active'),
  (33, 'iese', 'What are your least favorite parts of your current job and why?', 'Introduction / Self-Awareness', 2025, 'reddit', '', 'active'),
  (34, 'iese', 'Tell us about a time when you challenged a status quo.', 'Behavioral / Leadership / Collaboration', 2025, 'reddit', '', 'active'),
  (35, 'iese', 'When was the last time you were creative', 'Introduction / Self-Awareness', 2025, 'reddit', '', 'active'),
  (36, 'iese', 'Which specific role do you tend to play in a team?', 'Behavioral / Leadership / Collaboration', 2025, 'reddit', '', 'active'),
  (37, 'kellogg', 'What is one piece of advice you got and how did it inspire you to do things differently?', 'General', 2025, 'reddit', '', 'active'),
  (38, 'kellogg', 'What is a value that''s important to you and how would you bring that to Kellogg?', 'General', 2025, 'reddit', '', 'active'),
  (39, 'kellogg', 'Please tell us a time when you contributed to improving a process for a company, community, or organization.', 'General', 2025, 'reddit', '', 'active'),
  (40, 'kellogg', 'What is your leadership style?', 'General', 2025, 'reddit', '', 'active'),
  (41, 'kellogg', 'Tell us about a time you created value. What did you bring to the table that wasn''t there before?', 'General', 2025, 'reddit', '', 'active'),
  (42, 'kellogg', 'Tell us about a challenge you faced; how did it make you feel?', 'General', 2025, 'reddit', '', 'active'),
  (43, 'kellogg', 'What is a connection or relationship you had that helped you reach one of your goals?', 'General', 2025, 'reddit', '', 'active'),
  (44, 'kellogg', 'Reflecting on your experiences, what kind of an environment do you find you thrive in? What about the environment has helped you thrive?', 'General', 2025, 'reddit', '', 'active'),
  (45, 'kellogg', 'Introduce yourself by telling us something that is not on your resume (2024)', 'General', 2024, 'reddit', '', 'active'),
  (46, 'kellogg', 'Tell us about a relationship you leveraged to accomplish a goal (2024)', 'General', 2024, 'reddit', '', 'active'),
  (47, 'kellogg', 'Tell us about someone your admire and their leadership style (2024)', 'General', 2024, 'reddit', '', 'active'),
  (48, 'kellogg', 'Tell us about a time that you added value to your company', 'General', 2025, 'reddit', '', 'active'),
  (49, 'kellogg', 'Tell us about a time you created professional value by bringing something that was not on the table', 'General', 2025, 'reddit', '', 'active'),
  (50, 'kellogg', 'How did you pivot from an unforseen ask, last-minute demand, or unexpected situation', 'General', 2025, 'reddit', '', 'active'),
  (51, 'kellogg', 'How did you leverage a connection or relationship to facilitate a goal', 'General', 2025, 'reddit', '', 'active'),
  (52, 'kellogg', 'How did you pivot from an unforseen ask, last-minute demand, or unexpected situation', 'General', 2025, 'reddit', '', 'active'),
  (53, 'kellogg', 'How long have you considered an mba? what have you learned about yourself and your goals?', 'General', 2025, 'reddit', '', 'active'),
  (54, 'kellogg', 'What specifically about Kellogg MBA draws you to the program', 'General', 2025, 'reddit', '', 'active'),
  (55, 'kellogg', 'Tell me about a time when you realised you needed to ask for help to achieve a goal. How did you realise you couldn''t do it alone and what did you learn?', 'General', 2025, 'reddit', '', 'active'),
  (56, 'kellogg', 'Tell us about a time you went outside your comfort zone.', 'General', 2025, 'reddit', '', 'active'),
  (57, 'kellogg', 'What is a misconception your co-workers might have about you, and how would you change that?', 'General', 2025, 'reddit', '', 'active'),
  (58, 'kellogg', 'Tell us about a time you made a positive impact, what was it, why was it meaningful?', 'General', 2025, 'reddit', '', 'active'),
  (59, 'kellogg', 'Who is a leader you admire?', 'General', 2025, 'reddit', '', 'active'),
  (60, 'kellogg', 'Tell us about a time when conflict between two or more members from your team hurt overall productivity. What did you learn from it?', 'General', 2025, 'reddit', '', 'active'),
  (61, 'kellogg', 'Tell us about a time when you made a difficult decision.', 'General', 2025, 'reddit', '', 'active'),
  (62, 'kellogg', 'Tell us about a time you failed and had to change approach. What happened?', 'General', 2025, 'reddit', '', 'active'),
  (63, 'kellogg', 'Tell me about a life experience you''ve had outside of the classroom or the office that prepared you to pursue graduate-level education.', 'General', 2025, 'reddit', '', 'active'),
  (64, 'kellogg', 'There are so many great business schools. Why is Kellogg the right one for you?', 'General', 2025, 'reddit', '', 'active'),
  (65, 'kellogg', 'Tell us about a time when you had competing team members on your team, what that led to and what did you do about the situation?', 'General', 2025, 'reddit', '', 'active'),
  (66, 'kellogg', 'Tell us about a time you worked with people with different personalities. How did you handle the situation? How did you grow from the experience?', 'General', 2025, 'reddit', '', 'active'),
  (67, 'kellogg', 'Tell us about a time when you had to step outside your comfort zone? How did it make you feel?', 'General', 2025, 'reddit', '', 'active'),
  (68, 'kellogg', 'Tell us about a time when you were working on a team of individuals who had very different ways of thinking. What was the outcome?', 'General', 2025, 'reddit', '', 'active'),
  (69, 'kellogg', 'Tell us about a time when you were in a group and convinced them on some idea everyone was not in favour of.', 'General', 2025, 'reddit', '', 'active'),
  (70, 'kellogg', 'Tell us about a time when you worked in a dysfunctional team and how did you solve the issue?', 'General', 2025, 'reddit', '', 'active'),
  (71, 'kellogg', 'Tell us about a time when you had to work with somebody on a project whom you didn''t get along with. What was the outcome?', 'General', 2025, 'reddit', '', 'active'),
  (72, 'kellogg', 'Tell me a time when you are in competing team. What kind of effective ways did you take to make this team work more effectively.', 'General', 2025, 'reddit', '', 'active'),
  (73, 'kellogg', 'Tell us about a time when you had to work with a person whom you did not along with. What was the outcome?', 'General', 2025, 'reddit', '', 'active'),
  (74, 'kellogg', 'Explain the time when you were overwhelmed with your workload, how did you feel and how did you overcome?', 'General', 2025, 'reddit', '', 'active'),
  (75, 'kellogg', 'What''s been the greatest invention in your lifetime?', 'General', 2025, 'reddit', '', 'active'),
  (76, 'kellogg', 'A fun fact about yourself that you would like your class to know', 'General', 2025, 'reddit', '', 'active'),
  (77, 'mit', 'Describe an experience where you had to do something outside of your comfort zone.', 'General', 2025, 'reddit', '', 'active'),
  (78, 'mit', 'What personal characteristics make you a good team member?', 'General', 2025, 'reddit', '', 'active'),
  (79, 'mit', 'Which actor would you want to play you in a movie?', 'General', 2025, 'reddit', '', 'active'),
  (80, 'mit', 'Tell us about a time you had to make a presentation, what did you do and how did you approach it?', 'General', 2025, 'reddit', '', 'active'),
  (81, 'mit', 'What''s the hardest thing you''ve done outside of work?', 'General', 2025, 'reddit', '', 'active'),
  (82, 'mit', 'If you were a punctuation mark, which one would you be?', 'General', 2025, 'reddit', '', 'active'),
  (83, 'mit', 'Tell us something about you that is not on your resume.', 'General', 2025, 'reddit', '', 'active'),
  (84, 'mit', 'What was an interesting project you worked on during an internship?', 'General', 2025, 'reddit', '', 'active'),
  (85, 'mit', 'Tell us about a time you failed, what did you do and what did you learn from it?', 'General', 2025, 'reddit', '', 'active'),
  (86, 'mit', 'Tell us about a time when you had to lead communications in a crisis', 'General', 2025, 'reddit', '', 'active'),
  (87, 'mit', 'What''s a time you helped a coworker overcome a challenge?', 'General', 2025, 'reddit', '', 'active'),
  (88, 'mit', 'What is your greatest fear?', 'General', 2025, 'reddit', '', 'active'),
  (89, 'mit', 'Tell us about a time you had to rely on written communication to get your ideas across.', 'General', 2025, 'reddit', '', 'active'),
  (90, 'mit', 'Give me an example of when you had to use active listening skills to collaborate with a colleague/client/friend', 'General', 2025, 'reddit', '', 'active'),
  (91, 'mit', 'Tell us about a time when you had to communicate regularly with stakeholders. How did you ensure the stakeholders were informed and satisfied', 'General', 2025, 'reddit', '', 'active'),
  (92, 'mit', 'What are the qualities of a good leader?', 'General', 2025, 'reddit', '', 'active'),
  (93, 'mit', 'Describe a time when you had to make a decision with incomplete information', 'General', 2025, 'reddit', '', 'active'),
  (94, 'mit', 'Describe an area you want to improve in the coming year.', 'General', 2025, 'reddit', '', 'active'),
  (95, 'mit', 'Describe a project that you had to use your analytical abilities', 'General', 2025, 'reddit', '', 'active'),
  (96, 'mit', 'Describe a time when you had a conflict with a coworker and how you resolved it', 'General', 2025, 'reddit', '', 'active'),
  (97,  'yale', 'An MBA is a tremendous investment of time, money, and effort. Why do you think it is worth it for you?', 'General', 2025, 'reddit', '', 'active'),
  (98,  'yale', 'What food is your hometown known for and what does it say about your hometown?', 'General', 2025, 'reddit', '', 'active'),
  (99,  'yale', 'Yale Garstka Cup is a tradition that Yale holds every year. What is your favorite tradition that you participate in?', 'General', 2025, 'reddit', '', 'active'),
  (100, 'yale', 'Why is now the right time for you to do an MBA?', 'General', 2025, 'reddit', '', 'active'),
  (101, 'yale', 'What motivated you to pursue an MBA now?', 'General', 2025, 'reddit', '', 'active'),
  (102, 'yale', 'Tell us about a challenging work experience and how you handled it?', 'General', 2025, 'reddit', '', 'active'),
  (103, 'yale', 'Tell us about a time you didn''t have time for every task on your plate; how did you handle it?', 'General', 2025, 'reddit', '', 'active'),
  (104, 'yale', 'Tell us about a time you or your team could have taken a shortcut and didn''t. What was the outcome', 'General', 2025, 'reddit', '', 'active'),
  (105, 'yale', 'How have you handled an ambiguous project?', 'General', 2025, 'reddit', '', 'active'),
  (106, 'yale', 'Tell us about a time when you led a project without much/any supervision. What was the result ?', 'General', 2025, 'reddit', '', 'active'),
  (107, 'yale', 'Describe a time you prevented a problem from happening. What did you do?', 'General', 2025, 'reddit', '', 'active'),
  (108, 'yale', 'What does Yale''s mission mean to you?', 'General', 2025, 'reddit', '', 'active'),
  (109, 'yale', 'What does success look like to you', 'General', 2025, 'reddit', '', 'active'),
  (110, 'yale', 'Tell us about a time where you foresaw a big problem coming up at work and prevented it. What steps did you take and how?', 'General', 2025, 'reddit', '', 'active'),
  (111, 'yale', 'What would your friends and colleagues say your strengths and weaknesses are?', 'General', 2025, 'reddit', '', 'active'),
  (112, 'yale', 'Talk about a time when a team mate was not pulling their weight on a team project  nd how did you respond to it?', 'General', 2025, 'reddit', '', 'active'),
  (113, 'yale', 'Tell us about how you engaged with a community or an Organization.', 'General', 2025, 'reddit', '', 'active'),
  (114, 'yale', 'Tell us about your leadership style.', 'General', 2025, 'reddit', '', 'active'),
  (115, 'yale', 'How did you contribute to your company/organization?', 'General', 2025, 'reddit', '', 'active'),
  (116, 'yale', 'What accomplishment are you most proud of?', 'General', 2025, 'reddit', '', 'active'),
  (117, 'yale', 'Tell us about a difficult decision and how you handled it.', 'General', 2025, 'reddit', '', 'active'),
  (118, 'yale', 'Tell us about a creative solution you designed.', 'General', 2025, 'reddit', '', 'active'),
  (119, 'yale', 'How will you resolve a conflict with your future classmates at the program?', 'General', 2025, 'reddit', '', 'active'),
  (120, 'yale', 'Tell us about a time where you and your team encountered an obstacle and had to overcome it?', 'General', 2025, 'reddit', '', 'active'),
  (121, 'yale', 'Talk about a difficult situation you have experienced at work. Explain with details.', 'General', 2025, 'reddit', '', 'active'),
  (122, 'yale', 'Tell me about a time your team took a different direction from what originally had been planned. How did you adopt to it?', 'General', 2025, 'reddit', '', 'active'),
  (123, 'yale', 'What qualities would your friends use to describe you?', 'General', 2025, 'reddit', '', 'active'),
  (124, 'yale', 'What about your hometown do you find special? How has it shaped you?', 'General', 2025, 'reddit', '', 'active'),
  (125, 'yale', 'Yale''s Peabody museum of Natural history has an amazing collection of dinosaurs. Which part of the natural world are you drawn to and why ?', 'General', 2025, 'reddit', '', 'active'),
  (126, 'yale', 'The Yale library holds all kinds of classic literature. What book has had a significant impact on your life, and why?', 'General', 2025, 'reddit', '', 'active'),
  (127, 'yale', 'What is your favorite building/architecture?', 'General', 2025, 'reddit', '', 'active'),
  (128, 'yale', '"Without Arts, an education can not be accomplished" Do you agree or disagree? Why?', 'General', 2025, 'reddit', '', 'active'),
  (129, 'yale', '"As businesses become more global, the differences between cultures decrease." Do you agree or disagree? Why?', 'General', 2025, 'reddit', '', 'active'),
  (130, 'yale', 'What would you say is the biggest challenge facing leaders today?', 'General', 2025, 'reddit', '', 'active'),
  (131, 'yale', 'Do you think you need to live outside your country to develop a truly global mindset?', 'General', 2025, 'reddit', '', 'active'),
  (132, 'yale', 'Some have argued that income and education level are becoming more important than nationality as a way for people to organize themselves/identify. Do you agree?', 'General', 2025, 'reddit', '', 'active'),
  (133, 'yale', 'Some people say Technology is the main cause for lower wages and people losing their jobs instead of Globalization. What are your thoughts on this?', 'General', 2025, 'reddit', '', 'active'),
  (134, 'yale', 'Can a leader change the world alone? Why or why not?', 'General', 2025, 'reddit', '', 'active'),
  (135, 'yale', 'Water is considered to be a basic resource that should be available to all. Do you agree that all countries should budget 1% of their GDP towards free water to all in the world regardless of borders/ nationalities?', 'General', 2025, 'reddit', '', 'active'),
  (136, 'yale', 'Some say the most important leadership trait is the ability to influence others. do you agree?', 'General', 2025, 'reddit', '', 'active'),
  (137, 'yale', 'Some people think the most important external perspective of a company is the investor. do you agree?', 'General', 2025, 'reddit', '', 'active'),
  (138, 'yale', 'Some people say that government is more responsible for the environmental changes rather than the nimbleness of the markets. Do you agree with this statement and why?', 'General', 2025, 'reddit', '', 'active'),
  (139, 'yale', 'Some might argue that corporations are in fact better-suited to drive social change than non-profits or the government. What do you think?', 'General', 2025, 'reddit', '', 'active'),
  (140, 'yale', '"Imagination is more important than knowledge. For knowledge is limited to all we now know and understand, while imagination embraces the entire world, and all there ever will be to know and understand."Do you agree or disagree? Why?', 'General', 2025, 'reddit', '', 'active'),
  (141, 'yale', 'Some people believe that not enough importance is given to legal, political and social factors while doing business, do you agree?', 'General', 2025, 'reddit', '', 'active'),
  (142, 'yale', 'Some people say the perspective of the investor is the most important external one. Do you agree or disagree? Why?', 'General', 2025, 'reddit', '', 'active'),
  (143, 'yale', 'JFK once said "a rising tide lifts all the boats" to describe that a good economy benefits everyone. Do you think this still rings true today?', 'General', 2025, 'reddit', '', 'active'),
  (144, 'yale', 'Some people argue that in developing economies, you have to sacrifice investment in personal health and community for the sake of economic prosperity. Do you agree or disagree, and why?', 'General', 2025, 'reddit', '', 'active'),
  (145, 'yale', 'Some have argued that income and education level are becoming more important than nationality as a way for people to organize themselves/identify. Do you agree?', 'General', 2025, 'reddit', '', 'active'),
  (146, 'haas', 'Why an mba? Why haas?', 'General', 2025, 'reddit', '', 'active'),
  (147, 'haas', 'What''s your favorite food & why', 'General', 2025, 'reddit', '', 'active'),
  (148, 'haas', 'What do you hope to accomplish out of your business school experience and why is Haas the right place for this?', 'General', 2025, 'reddit', '', 'active'),
  (149, 'haas', 'Describe an experience in DE&I, whether in the workplace or at a community organization, that will enhance your contribution to the Haas community', 'General', 2025, 'reddit', '', 'active'),
  (150, 'haas', 'Tell us a time when you worked on a cross functional project where there was trouble getting alignment. How did you build consensus? What was the outcome', 'General', 2025, 'reddit', '', 'active'),
  (151, 'haas', 'Tell us a time when you influenced an outcome through trust and collaboration. How did it make you feel? How did you react?', 'General', 2025, 'reddit', '', 'active'),
  (152, 'haas', 'Is there anything else you would like to add that hasn''t been covered already', 'General', 2025, 'reddit', '', 'active'),
  (153, 'haas', 'Tell us something that shows how you will be able to contribute to diversity and inclusion on campus.', 'General', 2025, 'reddit', '', 'active'),
  (154, 'haas', 'Tell us about an experience when you led a team and the situation became stressful and morale was low. What did you do and what were the results?', 'General', 2025, 'reddit', '', 'active'),
  (155, 'haas', 'Tell us about a time when you argued with someone and turned out to be in the wrong.', 'General', 2025, 'reddit', '', 'active'),
  (156, 'haas', 'Tell us about a time when you worked on a team of people who had strong opinions. How did you overcome the situation?', 'General', 2025, 'reddit', '', 'active'),
  (157, 'haas', 'Tell us about a time when being humble led to a positive outcome.', 'General', 2025, 'reddit', '', 'active'),
  (158, 'haas', 'Tell us about a time when you collaborated with a cross-functional team. What was difficult about the process and what did you learn?', 'General', 2025, 'reddit', '', 'active'),
  (159, 'haas', 'Tell us about a time when you forged trust and collaboration with the people you work with. How did it make you feel and what did you learn?', 'General', 2025, 'reddit', '', 'active'),
  (160, 'haas', 'Tell us about a time when you had to align a team toward a common goal.', 'General', 2025, 'reddit', '', 'active'),
  (161, 'haas', 'Tell us about a time you took a risk in your professional life. What was the outcome and what did you learn from this experience?', 'General', 2025, 'reddit', '', 'active'),
  (162, 'haas', 'Give us an example of a time when you convinced your colleagues to do something that was not in their job descriptions. How did you go about convincing them?', 'General', 2025, 'reddit', '', 'active'),
  (163, 'haas', 'Tell us about a time when you demonstrated resilience in the face of adversity.', 'General', 2025, 'reddit', '', 'active'),
  (164, 'haas', 'Describe a time when you had to navigate a complex decision. How did you handle it?', 'General', 2025, 'reddit', '', 'active'),
  (165, 'mccombs', 'What is your short term goal and why?', 'General', 2025, 'reddit', '', 'active'),
  (166, 'mccombs', 'Tell me about a time when you had to change your plans at the last moment and how you handled the situation. What was the result?', 'General', 2025, 'reddit', '', 'active'),
  (167, 'mccombs', 'What do you do in your free time and what do you gain from it?', 'General', 2025, 'reddit', '', 'active'),
  (168, 'mccombs', 'Some question revolving about why McCombs. Don''t remember the specific prompt.', 'General', 2025, 'reddit', '', 'active'),
  (169, 'mccombs', 'What is your biggest passion outside of work, and why?', 'General', 2025, 'reddit', '', 'active'),
  (170, 'mccombs', 'What makes you unique and how will you contribute to the class and McCombs community? Please be specific in your answer.', 'General', 2025, 'reddit', '', 'active'),
  (171, 'mccombs', 'Introduce yourself and tell us who you are outside of work', 'General', 2025, 'reddit', '', 'active'),
  (172, 'mccombs', 'Tell us about a time when you overextended yourself and didn''t achieve all your commitments.', 'General', 2025, 'reddit', '', 'active'),
  (173, 'mccombs', 'Tell us about a time when a team member was not being heard and how you went about it.', 'General', 2025, 'reddit', '', 'active'),
  (174, 'mccombs', 'Tell us about a time when you work with a team and had to consider multiple opinions to solve a problem? How did you prioritize them?', 'General', 2025, 'reddit', '', 'active'),
  (175, 'mccombs', 'What are your short term goals? what''s an alternative to those?', 'General', 2025, 'reddit', '', 'active'),
  (176, 'mccombs', 'What are your short term goals?', 'General', 2025, 'reddit', '', 'active'),
  (177, 'mccombs', 'What has been the most difficult challenge you have faced so far?', 'General', 2025, 'reddit', '', 'active'),
  (178, 'mccombs', 'Tell me about a time you overextended yourself and didn''t achieve all your commitments?', 'General', 2025, 'reddit', '', 'active'),
  (179, 'mccombs', 'Tell me about a time you worked through a challenge as a team, and there was disagreement on how to move forward.', 'General', 2025, 'reddit', '', 'active'),
  (180, 'mccombs', 'What three qualities to you bring to McCombs?', 'General', 2025, 'reddit', '', 'active'),
  (181, 'mccombs', 'Share a story with us about a time when you might have used some extra help. How did you go about asking for assistance?', 'General', 2025, 'reddit', '', 'active'),
  (182, 'mccombs', 'Do you feel that the fulfilment of social responsibility should always take precedence over the pursuit of financial gain? If not, then why not?', 'General', 2025, 'reddit', '', 'active'),
  (183, 'mccombs', 'What attracts you to McCombs'' MBA programme specifically?', 'General', 2025, 'reddit', '', 'active'),
  (184, 'lbs', 'What will you gain from the London Business School MBA programme that you won''t gain from another MBA programme?', 'General', 2025, 'reddit', '', 'active'),
  (185, 'lbs', 'Describe a time when you were a leader', 'General', 2025, 'reddit', '', 'active'),
  (186, 'lbs', 'Tell me of a time when you had to adapt to a different culture', 'General', 2025, 'reddit', '', 'active'),
  (187, 'lbs', 'Tell us about a time you worked in a dysfunctional team. What did you do to improve it?', 'General', 2025, 'reddit', '', 'active'),
  (188, 'lbs', 'Tell us about a time you received feedback. How are you implementing it now?', 'General', 2025, 'reddit', '', 'active'),
  (189, 'lbs', 'If you could change one thing about your professional experience, what would it be?', 'General', 2025, 'reddit', '', 'active'),
  (190, 'lbs', 'Tell us about a time when you faced conflict at work.', 'General', 2025, 'reddit', '', 'active'),
  (191, 'lbs', 'What specific skills are you looking to gain at LBS?', 'General', 2025, 'reddit', '', 'active'),
  (192, 'lbs', 'What is the most significant personal weakness that you have identified, what did you do about it and what was the result?', 'General', 2025, 'reddit', '', 'active'),
  (193, 'lbs', 'Imagine you are proposing a business innovation idea for a class project and the audience is not interested. What would you do?', 'General', 2025, 'reddit', '', 'active'),
  (194, 'lbs', 'Do you consider yourself to be creative?', 'General', 2025, 'reddit', '', 'active')
ON CONFLICT (id) DO NOTHING;
