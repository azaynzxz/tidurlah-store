-- Allow public select (read) access to objects in 'products' bucket
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
CREATE POLICY "Allow public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'products');

-- Allow authenticated users to insert/upload objects into 'products' bucket
DROP POLICY IF EXISTS "Allow authenticated upload access" ON storage.objects;
CREATE POLICY "Allow authenticated upload access" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'products' 
    AND auth.role() = 'authenticated'
  );

-- Allow authenticated users to update/overwrite objects in 'products' bucket
DROP POLICY IF EXISTS "Allow authenticated update access" ON storage.objects;
CREATE POLICY "Allow authenticated update access" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'products' 
    AND auth.role() = 'authenticated'
  );

-- Allow authenticated users to delete objects in 'products' bucket
DROP POLICY IF EXISTS "Allow authenticated delete access" ON storage.objects;
CREATE POLICY "Allow authenticated delete access" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'products' 
    AND auth.role() = 'authenticated'
  );
