const BASE_URL = 'http://127.0.0.1:8000/api';

export async function submitStartSession() {
    const res = await fetch(`${BASE_URL}/battle/start/`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to start session');
    return res.json();
}

export async function submitVote(sessionId: string, voteResult: string, prompt: string, responseA: string, responseB: string) {
    const res = await fetch(`${BASE_URL}/battle/vote/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            session_id: sessionId,
            vote_result: voteResult,
            prompt,
            response_a: responseA,
            response_b: responseB
        })
    });
    if (!res.ok) throw new Error('Failed to submit vote');
    return res.json();
}

export async function fetchLeaderboard() {
    const res = await fetch(`${BASE_URL}/report/leaderboard/`);
    if (!res.ok) throw new Error('Failed to fetch leaderboard');
    return res.json();
}
