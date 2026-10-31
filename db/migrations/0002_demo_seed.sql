INSERT IGNORE INTO article_categories (slug, name, sort_order) VALUES
('parliament', 'Parliament', 1),
('public-policy', 'Public policy', 2),
('local-government', 'Local government', 3),
('youth-education', 'Youth & education', 4),
('economy', 'Economy & development', 5),
('fact-checking', 'Fact-checking', 6),
('civic-learning', 'Civic learning', 7);

INSERT IGNORE INTO article_sources (slug, name, source_type) VALUES ('demo-desk', 'Civic Link sample desk', 'demonstration');

INSERT IGNORE INTO news_articles (slug, category_slug, source_slug, title, excerpt, body, article_type, status, image_url, is_breaking, is_demo, published_at) VALUES
('questions-before-sharing-a-claim', 'fact-checking', 'demo-desk', 'Before you share a political claim, ask these three questions', 'A practical media-literacy checklist for checking the source, date and evidence behind a post.', 'Illustrative sample copy. This is not reporting about a current political event.', 'civic_explainer', 'published', '/images/kampala-skyline.jpg', 0, 1, CURRENT_TIMESTAMP),
('reading-a-public-document', 'public-policy', 'demo-desk', 'A simple guide to reading a public document', 'Find the date, issuing institution and source material before drawing a conclusion.', 'Illustrative sample copy. Check official sources before relying on specific claims.', 'civic_explainer', 'published', NULL, 0, 1, CURRENT_TIMESTAMP),
('constructive-community-question', 'local-government', 'demo-desk', 'How to frame a clear question for a public representative', 'A focused question can make it easier for an office to understand the issue.', 'Illustrative sample copy. A public submission does not guarantee an official response.', 'civic_explainer', 'published', NULL, 0, 1, CURRENT_TIMESTAMP),
('understanding-editorial-labels', 'fact-checking', 'demo-desk', 'What do the labels on a civic news story mean?', 'Reporting, opinion, official statements and sponsored material serve different purposes.', 'Illustrative sample copy for the Civic Link interface.', 'civic_explainer', 'published', NULL, 0, 1, CURRENT_TIMESTAMP);

INSERT IGNORE INTO civic_courses (slug, title, summary, category, status, is_demo) VALUES
('understanding-democracy', 'Understanding Democracy', 'Explore participation, representation and public accountability through short, carefully sourced lessons.', 'Foundations', 'published', 1),
('constitution-of-uganda', 'The Constitution of Uganda', 'A guided learning pathway to reading the Constitution from authoritative source material.', 'Institutions', 'published', 1),
('role-of-parliament', 'The Role of Parliament', 'Learn how to find public parliamentary information and distinguish documents from commentary.', 'Institutions', 'published', 1),
('how-laws-are-made', 'How Laws Are Made', 'An introductory course designed to be checked against current official procedure before launch.', 'Institutions', 'published', 1),
('local-government', 'Local Government', 'A starting point for learning about local public institutions and official information.', 'Community', 'published', 1),
('citizens-rights', 'Citizens’ Rights and Responsibilities', 'Review rights and responsibilities using the relevant primary legal sources.', 'Foundations', 'published', 1),
('electoral-education', 'Electoral Education', 'Find trusted election information and build a plan for checking dates and procedures.', 'Participation', 'published', 1),
('leadership-and-ethics', 'Leadership and Public Ethics', 'Consider public-service values, responsible leadership and accountability.', 'Participation', 'published', 1),
('public-finance', 'Public Finance and National Budgets', 'An introductory guide to budget documents and questions to ask of the source material.', 'Public finance', 'published', 1),
('executive-institutions', 'Executive and Government Institutions', 'Learn to identify public bodies and find the primary sources that describe their responsibilities.', 'Institutions', 'published', 1),
('accountability-transparency', 'Accountability and Transparency', 'Practice tracing public claims to evidence and keeping corrections and source context visible.', 'Public finance', 'published', 1),
('media-literacy', 'Media Literacy and Fact-checking', 'Practice checking a claim’s source, context, date and supporting evidence.', 'Digital citizenship', 'published', 1),
('peaceful-participation', 'Peaceful Political Participation', 'Learn about constructive discussion and peaceful ways to take part in civic life.', 'Participation', 'published', 1),
('youth-leadership', 'Youth Leadership', 'Explore practical ways for young people to learn and contribute to community life.', 'Youth', 'published', 1);

INSERT IGNORE INTO course_lessons (slug, course_slug, title, body, sort_order, source_note) VALUES
('media-literacy-source', 'media-literacy', 'Start with the source', 'Look for the complete, original document or institution publication. This sample lesson requires editorial and source review before public use.', 1, 'Demonstration content; primary sources required.'),
('media-literacy-context', 'media-literacy', 'Check context and date', 'Check the publication date and what evidence supports a claim. This sample lesson is not a current fact-check.', 2, 'Demonstration content; primary sources required.'),
('democracy-participation', 'understanding-democracy', 'Participation and public life', 'An introductory sample lesson. Review and cite authoritative learning resources before launch.', 1, 'Demonstration content; verify before publication.'),
('constitution-reading', 'constitution-of-uganda', 'Find the primary text', 'Start with the original text and check that it is the current authoritative version. This example does not interpret the law.', 1, 'Use current official source material before publication.'),
('parliament-source', 'role-of-parliament', 'Find public information', 'A sample learning step on locating original public records. Confirm procedures and official resources before launch.', 1, 'Demonstration content; verify current institutional procedure.');

INSERT IGNORE INTO public_representatives (slug, display_name, office_title, constituency, region, profile_text, verification_status, is_demo) VALUES
('sample-public-profile-1', 'Sample public profile', 'Representative profile example', 'Central Region · demo record', 'Central', 'This fictional placeholder demonstrates the profile layout. It is not a real office-holder.', 'unverified', 1),
('sample-public-profile-2', 'Sample institutional profile', 'Institutional contact example', 'Uganda · demo record', 'National', 'This fictional placeholder is not an official institution or contact channel.', 'unverified', 1),
('sample-public-profile-3', 'Sample constituency profile', 'Constituency profile example', 'Eastern Region · demo record', 'Eastern', 'This fictional placeholder demonstrates directory navigation only.', 'unverified', 1);

INSERT IGNORE INTO public_events (slug, title, description, organizer, status, is_demo) VALUES ('sample-civic-event', 'Sample civic learning event', 'Placeholder event for the Civic Link interface. No registration or real event details are provided.', 'Civic Link demo desk', 'draft', 1);
INSERT IGNORE INTO discussion_topics (slug, title, description, status) VALUES ('constructive-dialogue', 'Constructive civic dialogue', 'Sample topic placeholder; discussion posts are not enabled in this MVP.', 'draft');
