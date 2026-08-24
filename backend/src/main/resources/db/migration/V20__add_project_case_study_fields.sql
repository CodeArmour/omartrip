ALTER TABLE portfolio_projects
    ADD COLUMN case_study_problem VARCHAR(1400),
    ADD COLUMN case_study_solution VARCHAR(1400),
    ADD COLUMN case_study_result VARCHAR(1400);

UPDATE portfolio_projects
SET
    case_study_problem = 'Andalucia needed a sharper digital presence for a technical consultancy. The old experience did not make the firm''s engineering authority, service areas, and credibility clear enough for new visitors.',
    case_study_solution = 'I structured the site around a clearer consulting story, direct service messaging, and a polished visual system that feels professional without becoming heavy. The interface gives visitors a faster path from first impression to understanding what the company does.',
    case_study_result = 'The final website presents the company with more confidence, makes the consultancy offer easier to scan, and supports a more premium first impression for prospective clients and partners.'
WHERE id = 'f8a1f0ab-12bb-4f19-a910-1f30e0fb1002';

UPDATE portfolio_projects
SET
    case_study_problem = 'Moon Glow needed a travel website that could make destinations feel curated and easy to explore, while still guiding visitors toward the next step in planning a trip.',
    case_study_solution = 'I built an editorial destination experience with strong imagery, organized destination cards, and a cleaner browsing flow. The design keeps the travel feeling aspirational while making the content practical and easy to navigate.',
    case_study_result = 'The site gives Moon Glow a more polished travel presence, helps visitors understand available destinations quickly, and creates a clearer path from inspiration to inquiry.'
WHERE id = 'f8a1f0ab-12bb-4f19-a910-1f30e0fb1001';

UPDATE portfolio_projects
SET
    case_study_problem = COALESCE(case_study_problem, 'The project needed a clearer digital experience that could communicate the offer quickly and feel credible from the first visit.'),
    case_study_solution = COALESCE(case_study_solution, 'I shaped the interface around focused messaging, responsive layouts, and a visual system tailored to the project''s audience and goals.'),
    case_study_result = COALESCE(case_study_result, 'The result is a more polished, easier-to-use web presence that helps visitors understand the work and move toward the intended action.');

ALTER TABLE portfolio_projects
    ALTER COLUMN case_study_problem SET NOT NULL,
    ALTER COLUMN case_study_solution SET NOT NULL,
    ALTER COLUMN case_study_result SET NOT NULL;
