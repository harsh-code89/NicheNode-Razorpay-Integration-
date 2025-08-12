import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
}

interface RegisterRequest {
  username: string
  password: string
  user_type: 'consultant' | 'seeker'
  full_name?: string
}

interface LoginRequest {
  username: string
  password: string
}

interface ConsultantProfileRequest {
  skill_name: string
  skill_description: string
  experience_years: number
  hourly_rate?: number
  tags?: string[]
}

// Simple keyword-based skill verification (same as ai-skills function)
function verifySkill(skillTitle: string, skillDescription: string): { isVerified: boolean, confidence: number } {
  const title = skillTitle.toLowerCase()
  const description = skillDescription.toLowerCase()
  
  // Check for spam indicators
  const spamKeywords = ['make money fast', 'get rich quick', 'guaranteed income', 'no experience needed', 'work from home easy']
  const hasSpam = spamKeywords.some(keyword => description.includes(keyword))
  
  if (hasSpam) {
    return { isVerified: false, confidence: 0.1 }
  }
  
  // Check for generic descriptions
  if (description.length < 50) {
    return { isVerified: false, confidence: 0.3 }
  }
  
  // Check for technical skill indicators
  const technicalKeywords = [
    'programming', 'development', 'software', 'code', 'algorithm', 'database', 'api',
    'design', 'analysis', 'consulting', 'expertise', 'experience', 'years', 'project',
    'client', 'solution', 'implementation', 'optimization', 'troubleshooting',
    'legacy', 'system', 'maintenance', 'integration', 'architecture'
  ]
  
  const technicalMatches = technicalKeywords.filter(keyword => 
    title.includes(keyword) || description.includes(keyword)
  ).length
  
  // Check for specific skill mentions
  const specificSkills = [
    'cobol', 'fortran', 'pascal', 'assembly', 'mainframe', 'as400',
    'excel', 'vba', 'macro', 'spreadsheet', 'pivot', 'formula',
    'antique', 'vintage', 'restoration', 'authentication', 'appraisal',
    'genealogy', 'research', 'historical', 'archive', 'documentation'
  ]
  
  const specificMatches = specificSkills.filter(skill => 
    title.includes(skill) || description.includes(skill)
  ).length
  
  // Calculate confidence score
  let confidence = 0.5 // Base confidence
  confidence += technicalMatches * 0.05 // +5% per technical keyword
  confidence += specificMatches * 0.1 // +10% per specific skill
  
  // Bonus for detailed descriptions
  if (description.length > 200) confidence += 0.1
  if (description.length > 500) confidence += 0.1
  
  // Check for professional language patterns
  const professionalPatterns = [
    'years of experience', 'worked with', 'specialized in', 'expert in',
    'proficient in', 'certified', 'trained', 'background in'
  ]
  
  const professionalMatches = professionalPatterns.filter(pattern => 
    description.includes(pattern)
  ).length
  
  confidence += professionalMatches * 0.08
  
  // Cap confidence at 1.0
  confidence = Math.min(confidence, 1.0)
  
  const isVerified = confidence >= 0.7
  
  return { isVerified, confidence }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const url = new URL(req.url)
    const path = url.pathname.replace('/functions/v1/auth-api', '')

    // POST /register
    if (path === '/register' && req.method === 'POST') {
      const { username, password, user_type, full_name }: RegisterRequest = await req.json()

      // Create user with Supabase Auth
      const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
        email: username,
        password: password,
        user_metadata: {
          full_name: full_name || '',
          user_type: user_type
        }
      })

      if (authError) {
        return new Response(
          JSON.stringify({ error: authError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Update profile with user type
      const { error: profileError } = await supabaseClient
        .from('profiles')
        .update({ 
          is_expert: user_type === 'consultant',
          full_name: full_name || ''
        })
        .eq('id', authData.user.id)

      if (profileError) {
        return new Response(
          JSON.stringify({ error: profileError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ 
          message: 'User registered successfully',
          user_id: authData.user.id,
          user_type: user_type
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // POST /login
    if (path === '/login' && req.method === 'POST') {
      const { username, password }: LoginRequest = await req.json()

      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: username,
        password: password
      })

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Get user profile
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

      return new Response(
        JSON.stringify({
          message: 'Login successful',
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          user: {
            id: data.user.id,
            email: data.user.email,
            user_type: profile?.is_expert ? 'consultant' : 'seeker',
            full_name: profile?.full_name
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // POST /consultants/profile
    if (path === '/consultants/profile' && req.method === 'POST') {
      const authHeader = req.headers.get('Authorization')
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: 'Authorization header required' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const token = authHeader.replace('Bearer ', '')
      const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)

      if (userError || !user) {
        return new Response(
          JSON.stringify({ error: 'Invalid token' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { skill_name, skill_description, experience_years, hourly_rate, tags }: ConsultantProfileRequest = await req.json()

      // Use AI verification
      const verification = verifySkill(skill_name, skill_description)

      // Check if expert profile already exists
      const { data: existingExpert } = await supabaseClient
        .from('experts')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (existingExpert) {
        // Update existing profile
        const { error } = await supabaseClient
          .from('experts')
          .update({
            skill_title: skill_name,
            description: skill_description,
            hourly_rate: hourly_rate || 50,
            tags: tags || [],
            verified: verification.isVerified,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      } else {
        // Create new expert profile
        const { error } = await supabaseClient
          .from('experts')
          .insert({
            user_id: user.id,
            skill_title: skill_name,
            description: skill_description,
            hourly_rate: hourly_rate || 50,
            tags: tags || [],
            verified: verification.isVerified
          })

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Update profile to mark as expert
        await supabaseClient
          .from('profiles')
          .update({ is_expert: true })
          .eq('id', user.id)
      }

      return new Response(
        JSON.stringify({ 
          message: 'Consultant profile updated successfully',
          verification: verification
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // GET /consultants
    if (path === '/consultants' && req.method === 'GET') {
      const { data: consultants, error } = await supabaseClient
        .from('experts')
        .select(`
          *,
          profiles!experts_user_id_fkey (
            full_name,
            avatar_url,
            email
          ),
          reviews (
            rating
          )
        `)
        .eq('verified', true)

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const formattedConsultants = consultants.map(consultant => ({
        id: consultant.id,
        user_id: consultant.user_id,
        skill_name: consultant.skill_title,
        skill_description: consultant.description,
        hourly_rate: consultant.hourly_rate,
        response_time: consultant.response_time,
        verified: consultant.verified,
        tags: consultant.tags,
        full_name: consultant.profiles?.full_name,
        avatar_url: consultant.profiles?.avatar_url,
        email: consultant.profiles?.email,
        average_rating: consultant.reviews?.length > 0 
          ? consultant.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / consultant.reviews.length
          : 0,
        review_count: consultant.reviews?.length || 0,
        created_at: consultant.created_at
      }))

      return new Response(
        JSON.stringify({ consultants: formattedConsultants }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Endpoint not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})