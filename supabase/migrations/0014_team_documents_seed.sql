-- Seed data for team_documents: the club's initial Team Info document
-- library (created_by left null — no real coach UUID exists at migration
-- time, same as the calendar_events seed).

insert into team_documents (title, url, description, created_by) values
  (
    'New Paddler Information Pack',
    'https://docs.google.com/presentation/d/1Z-rrJeNzbOjA-FCprRpWgu0NnRZ0q3__raPd94zENxI/mobilepresent?slide=id.g185bf2e7432_0_178',
    'New to the team? Or just didn''t read when you joined? Here''s a comprehensive guide to the team, our trainings and other important details.',
    null
  ),
  (
    'Sponsorship Details',
    'https://docs.google.com/presentation/d/1YSbALg-HtkOeB2ExyRfpsXRslTBzwBmByoNelP7vmj4/edit?slide=id.g2fa85e52cc4_0_1#slide=id.g2fa85e52cc4_0_1',
    'Even more information on our sponsors!',
    null
  );
