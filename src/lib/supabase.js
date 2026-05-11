import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://uaxzumwybijfjvfnnvbs.supabase.co'
const supabaseAnonKey = 'sb_publishable_Uh-YrxoLi4z0MrUqND4KzA_qCjvJo1n'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
