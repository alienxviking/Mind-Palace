import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function fetchNodes() {
    const { data, error } = await supabase
        .from('nodes')
        .select('*')
        .order('created_at', { ascending: true })
    if (error) throw error
    return data
}

export async function fetchEdges() {
    const { data, error } = await supabase
        .from('edges')
        .select('*')
    if (error) throw error
    return data
}

export async function createNode(node: any) {
    const { data, error } = await supabase
        .from('nodes')
        .insert([{
            title: node.title,
            color: node.color,
            position: node.position, // [x, y, z] float8 array
            tags: node.tags,
            planet_type: node.planetType,
            summary: node.summary
        }])
        .select()
    if (error) throw error
    return data[0]
}

export async function createEdge(edge: { source_id: string, target_id: string }) {
    const { data, error } = await supabase
        .from('edges')
        .insert([edge])
        .select()
    if (error) throw error
    return data[0]
}

export async function deleteNode(id: string) {
    const { error } = await supabase
        .from('nodes')
        .delete()
        .eq('id', id)
    if (error) throw error
}

export async function updateNode(id: string, updates: any) {
    const { data, error } = await supabase
        .from('nodes')
        .update(updates)
        .eq('id', id)
        .select()
    if (error) throw error
    return data[0]
}
