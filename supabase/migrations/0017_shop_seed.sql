-- Seed data for the shop: the club's real Hazonas apparel lineup, size
-- charts, and per-size stock (flat 5 per size, same as MOCK_SHOP_STYLES /
-- MOCK_SHOP_STYLE_SIZES / MOCK_SHOP_SIZE_CHARTS in src/lib/mock-data.ts —
-- 0015_shop.sql created the tables but never seeded them, unlike
-- calendar_events/team_documents).

insert into shop_size_charts (name, image_url) values
  ('Drinking Shirt', '/shop/size-charts/drinking-shirt.jpg'),
  ('Rashie / Hooded Rashie', '/shop/size-charts/rashie.jpg'),
  ('Rashie Slimfit / Hooded Rashie Slimfit', '/shop/size-charts/rashie-slimfit.jpg'),
  ('Singlet', '/shop/size-charts/singlet.jpg'),
  ('T-Shirt', '/shop/size-charts/tshirt.jpg');

insert into shop_styles (name, description, image_url, size_chart_id)
select v.name, v.description, v.image_url, c.id
from (
  values
    ('Drinking Shirt', 'Collared social shirt for post-race drinks and club events, crew crest embroidered.', '/shop/drinking-shirt.jpg', 'Drinking Shirt'),
    ('Hooded Rashie', 'Long-sleeve UV rash guard with hood, built for full-sun water sessions.', '/shop/hooded-rashie.jpg', 'Rashie / Hooded Rashie'),
    ('Hooded Rashie Slimfit', 'Slim-cut version of the hooded rash guard for a closer, race-day fit.', '/shop/hooded-rashie-slimfit.jpg', 'Rashie Slimfit / Hooded Rashie Slimfit'),
    ('Rashie', 'Long-sleeve UV rash guard, standard fit for training and racing on the water.', '/shop/rashie.jpg', 'Rashie / Hooded Rashie'),
    ('Rashie Slimfit', 'Slim-cut long-sleeve rash guard for a closer, race-day fit.', '/shop/rashie-slimfit.jpg', 'Rashie Slimfit / Hooded Rashie Slimfit'),
    ('Singlet', 'Sports singlet for gym and land training, breathable four-way stretch.', null, 'Singlet'),
    ('T-Shirt', 'Everyday club tee for training, socials, and travel days.', null, 'T-Shirt')
) as v(name, description, image_url, chart_name)
join shop_size_charts c on c.name = v.chart_name;

-- Real Hazonas size runs per garment (see public/shop/size-charts/) — trial
-- stock is flat at 5 per size across the board, not yet tied to real
-- supplier counts (matches SHOP_STYLE_SIZE_RUNS in mock-data.ts).
with size_runs (style_name, sizes) as (
  values
    ('Drinking Shirt', array['3XS','2XS','XS','S','M','L','XL','2XL','3XL']),
    ('Hooded Rashie', array['3XS','2XS','XS','S','M','L','XL','2XL','3XL']),
    ('Hooded Rashie Slimfit', array['3XS','2XS','XS','S','M','L','XL','2XL','3XL','4XL']),
    ('Rashie', array['3XS','2XS','XS','S','M','L','XL','2XL','3XL']),
    ('Rashie Slimfit', array['3XS','2XS','XS','S','M','L','XL','2XL','3XL','4XL']),
    ('Singlet', array['3XS','2XS','XS','S','M','L','XL','2XL','3XL']),
    ('T-Shirt', array['3XS','2XS','XS','S','M','L','XL','2XL','3XL','4XL','5XL','6XL'])
)
insert into shop_style_sizes (style_id, size, stock_count)
select s.id, sz.size, 5
from size_runs r
join shop_styles s on s.name = r.style_name
cross join unnest(r.sizes) as sz(size);
