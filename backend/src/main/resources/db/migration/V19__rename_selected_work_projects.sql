UPDATE portfolio_projects
SET
    title = 'Andalucia Engineering Consulting',
    title_line_one = 'Andalucia Engineering',
    title_line_two = 'Consulting',
    category = 'Engineering · Website',
    display_order = 0,
    updated_at = CURRENT_TIMESTAMP
WHERE id = 'f8a1f0ab-12bb-4f19-a910-1f30e0fb1002';

UPDATE portfolio_projects
SET
    title = 'Moon Glow Travel',
    title_line_one = 'Moon Glow',
    title_line_two = 'Travel',
    category = 'Travel · Website',
    image_alt = 'Moon Glow Travel website showing curated destinations in Egypt, Saudi Arabia, Qatar and Dubai',
    customer_photo_alt = 'Moon Glow Travel brand preview',
    display_order = 1,
    updated_at = CURRENT_TIMESTAMP
WHERE id = 'f8a1f0ab-12bb-4f19-a910-1f30e0fb1001';
