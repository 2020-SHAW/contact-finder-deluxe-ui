// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ghlnlicavpnpdioncvmp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdobG5saWNhdnBucGRpb25jdm1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1MTQ3MjksImV4cCI6MjA2MDA5MDcyOX0.rT9uaIDUahVvljM3adxnDBtR4WoRQCCiW6wZZ95113w";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);