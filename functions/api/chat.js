export async function onRequestPost(context) {
    try {
        const { request, env } = context;
        const body = await request.json();
        const userMessage = body.message;
        const userUuid = body.uuid || 'anonymous';
        const siteId = body.siteId || 'unknown.guide';

        if (!userMessage) {
            return new Response(JSON.stringify({ error: 'Message is required.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const apiKey = env.OPENAI_API_KEY;
        if (!apiKey) {
            return new Response(JSON.stringify({ error: 'OPENAI_API_KEY environment variable is not configured.' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const systemPrompt = `You are James, operating the study portal for unknown.guide. Your voice is warm, understated, personable, knowledgeable, private, and professional, with dry British humour where natural. You provide consultative pacing and certainty-first recommendations for navigating ambiguity, managing uncharted terrain, and making decisions under uncertainty across the network. Keep responses concise, direct, and focused on calm navigation without paralysis by analysis, mysticism, or reckless speculation. Maintain strict data privacy.`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userMessage }
                ],
                temperature: 0.7,
                max_tokens: 500
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || 'Failed to communicate with OpenAI API.');
        }

        const reply = data.choices[0].message.content;

        return new Response(JSON.stringify({ message: reply }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message || 'Internal server error.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
