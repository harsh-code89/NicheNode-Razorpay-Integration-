const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
}

interface SkillVerificationRequest {
  skill_title: string
  skill_description: string
}

interface SearchSkillsRequest {
  query: string
  limit?: number
}

// Simple keyword-based skill verification
function verifySkill(skillTitle: string, skillDescription: string): { isVerified: boolean, confidence: number, reason: string } {
  const title = skillTitle.toLowerCase()
  const description = skillDescription.toLowerCase()
  
  // Check for spam indicators
  const spamKeywords = ['make money fast', 'get rich quick', 'guaranteed income', 'no experience needed', 'work from home easy']
  const hasSpam = spamKeywords.some(keyword => description.includes(keyword))
  
  if (hasSpam) {
    return { isVerified: false, confidence: 0.1, reason: 'Contains spam-like content' }
  }
  
  // Check for generic descriptions
  if (description.length < 50) {
    return { isVerified: false, confidence: 0.3, reason: 'Description too short or generic' }
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
  const reason = isVerified 
    ? `High confidence skill (${Math.round(confidence * 100)}%)`
    : confidence >= 0.5 
      ? `Moderate confidence - needs manual review (${Math.round(confidence * 100)}%)`
      : `Low confidence - likely generic or insufficient detail (${Math.round(confidence * 100)}%)`
  
  return { isVerified, confidence, reason }
}

// Simple text similarity function
function calculateSimilarity(text1: string, text2: string): number {
  const words1 = text1.toLowerCase().split(/\W+/).filter(w => w.length > 2)
  const words2 = text2.toLowerCase().split(/\W+/).filter(w => w.length > 2)
  
  const set1 = new Set(words1)
  const set2 = new Set(words2)
  
  const intersection = new Set([...set1].filter(x => set2.has(x)))
  const union = new Set([...set1, ...set2])
  
  return intersection.size / union.size // Jaccard similarity
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    // Normalize path by removing function prefix and trailing slashes
    const path = url.pathname.replace('/functions/v1/ai-skills', '').replace(/\/$/, '') || '/'

    // POST /verify - Verify a skill description
    if (path === '/verify' && req.method === 'POST') {
      try {
        const body = await req.json()
        const { skill_title, skill_description }: SkillVerificationRequest = body
        
        if (!skill_title || !skill_description) {
          return new Response(
            JSON.stringify({ error: 'skill_title and skill_description are required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        const verification = verifySkill(skill_title, skill_description)
        
        return new Response(
          JSON.stringify(verification),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } catch (parseError) {
        return new Response(
          JSON.stringify({ error: 'Invalid JSON in request body' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // GET /search - Search for consultants by skill query
    if (path === '/search' && req.method === 'GET') {
      try {
        // Import Supabase client only when needed for search functionality
        const { createClient } = await import('npm:@supabase/supabase-js@2')
        
        const supabaseUrl = Deno.env.get('SUPABASE_URL')
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
        
        if (!supabaseUrl || !supabaseKey) {
          return new Response(
            JSON.stringify({ error: 'Supabase configuration missing' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const supabaseClient = createClient(supabaseUrl, supabaseKey)
        
        const query = url.searchParams.get('query') || ''
        const limit = parseInt(url.searchParams.get('limit') || '10')
        
        if (!query.trim()) {
          return new Response(
            JSON.stringify({ error: 'Query parameter is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Get all verified consultants
        const { data: consultants, error } = await supabaseClient
          .from('experts')
          .select(`
            *,
            profiles!experts_user_id_fkey (
              full_name,
              avatar_url
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

        // Calculate similarity scores and sort
        const scoredConsultants = consultants.map(consultant => {
          const titleSimilarity = calculateSimilarity(query, consultant.skill_title)
          const descriptionSimilarity = calculateSimilarity(query, consultant.description)
          const tagsSimilarity = consultant.tags.length > 0 
            ? Math.max(...consultant.tags.map((tag: string) => calculateSimilarity(query, tag)))
            : 0
          
          // Weighted similarity score
          const overallScore = (titleSimilarity * 0.5) + (descriptionSimilarity * 0.3) + (tagsSimilarity * 0.2)
          
          return {
            ...consultant,
            similarity_score: overallScore,
            average_rating: consultant.reviews?.length > 0 
              ? consultant.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / consultant.reviews.length
              : 0
          }
        })
        .filter(consultant => consultant.similarity_score > 0.1) // Filter out very low matches
        .sort((a, b) => b.similarity_score - a.similarity_score) // Sort by relevance
        .slice(0, limit)

        return new Response(
          JSON.stringify({ 
            consultants: scoredConsultants,
            total_results: scoredConsultants.length,
            query: query
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } catch (searchError) {
        return new Response(
          JSON.stringify({ error: 'Search functionality temporarily unavailable' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    return new Response(
      JSON.stringify({ error: 'Endpoint not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})