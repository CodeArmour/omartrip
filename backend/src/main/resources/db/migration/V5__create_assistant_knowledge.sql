CREATE TABLE assistant_knowledge_documents (
    id UUID PRIMARY KEY,
    slug VARCHAR(80) NOT NULL UNIQUE,
    title VARCHAR(120) NOT NULL,
    content TEXT NOT NULL,
    keywords VARCHAR(500) NOT NULL,
    embedding TEXT,
    embedding_model VARCHAR(80),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO assistant_knowledge_documents (id, slug, title, content, keywords) VALUES
('21f20ed1-b194-4742-969f-bb3e153ac101', 'identity', 'Omar and Omi', 'Omar Abusahmoud is a Software Engineer based in Brussels, Belgium. Omi is Omar''s right hand and portfolio assistant, helping visitors understand Omar''s work, skills, services, experience, and availability.', 'omar omi identity software engineer brussels belgium assistant'),
('21f20ed1-b194-4742-969f-bb3e153ac102', 'services', 'Services', 'Omar provides web development, mobile applications, custom software, cloud and DevOps engineering, and practical AI solutions. He shapes technology around real business needs and builds reliable digital products.', 'services web mobile custom software cloud devops ai business'),
('21f20ed1-b194-4742-969f-bb3e153ac103', 'skills', 'Technical skills', 'Omar works with Next.js, React, TypeScript, Tailwind CSS, Java, Spring Boot, Node.js, Python, Flutter, Docker, AWS, Git, PostgreSQL, JPA, and AI integrations across frontend, backend, mobile, and cloud systems.', 'skills stack technologies frontend backend java spring next react typescript flutter docker aws postgresql'),
('21f20ed1-b194-4742-969f-bb3e153ac104', 'experience', 'Experience and education', 'Omar founded Miners Group, a software services company delivering web, mobile, custom software, cloud, and AI solutions. He graduated in Computer Science from the Faculty of Informatics at the University of Nyiregyhaza.', 'experience education miners group founder university nyiregyhaza computer science'),
('21f20ed1-b194-4742-969f-bb3e153ac105', 'moon-glow', 'Moon Glow Travel Agent', 'Moon Glow Travel Agent is an editorial travel website built with Next.js, TypeScript, and Tailwind CSS. It helps visitors discover destinations and begin planning a tailored journey. The live project is available at https://moon-two-flame.vercel.app/.', 'project moon glow travel nextjs typescript tailwind destinations'),
('21f20ed1-b194-4742-969f-bb3e153ac106', 'andalucia', 'Andalucia Engineering Consulting', 'Andalucia Engineering Consulting is a corporate website built with Next.js, TypeScript, and Tailwind CSS. It organizes consultancy services, industries, and engineering expertise into a clear digital introduction. The live project is available at https://www.andaluciagroup.eu/.', 'project andalucia engineering consulting corporate nextjs typescript tailwind'),
('21f20ed1-b194-4742-969f-bb3e153ac107', 'location-contact', 'Location and contact', 'Omar is based in Brussels, Belgium. Visitors can use Book a Call to request a 30-minute conversation or use the My Links page for GitHub, LinkedIn, and email. Booking requests remain pending until Omar reviews them.', 'location brussels belgium contact availability book call email github linkedin'),
('21f20ed1-b194-4742-969f-bb3e153ac108', 'mindset', 'Mindset and interests', 'Omar values discipline, focus, consistency, balance, and reflection. Training and personal growth support the mindset he brings to software engineering and collaboration.', 'mindset interests discipline focus training consistency balance reflection');
