import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://efqkfoisfwttddwxbdoy.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmcWtmb2lzZnd0dGRkd3hiZG95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MjY2NTUsImV4cCI6MjA5NTQwMjY1NX0.-l_zqmirr0bfWxADgB822MS7KU-2QwoWkNxUpoQoMW4"
);