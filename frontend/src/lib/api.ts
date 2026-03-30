import { config } from '../config';

const BASE_URL = config.API_BASE_URL;

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

export async function fetchLeaderboard(category?: string) {
    const url = category ? `${BASE_URL}/report/leaderboard/?category=${category}` : `${BASE_URL}/report/leaderboard/`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch leaderboard');
    return res.json();
}

export async function fetchStats() {
    const res = await fetch(`${BASE_URL}/stats/`);
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
}

export interface ModelPoolItem {
    id: string;
    display_name: string;
    provider: string;
    tier: 'flagship' | 'fast' | 'reasoning';
}

export interface ModelPoolResponse {
    week_key: string;
    week_label: string;
    models: ModelPoolItem[];
    all_count: number;
    expires_at: string;
}

export async function fetchModelPool(): Promise<ModelPoolResponse> {
    const res = await fetch(`${BASE_URL}/model-pool/`);
    if (!res.ok) throw new Error('Failed to fetch model pool');
    return res.json();
}
