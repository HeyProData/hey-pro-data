/**
 * Helper functions for gigs API
 */

import { createServerClient } from './server';

/**
 * Generate URL-friendly slug from title
 * Example: "4 Video Editors for Shortfilm" → "4-video-editors-shortfilm"
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-')      // Replace spaces with hyphens
    .replace(/--+/g, '-')      // Replace multiple hyphens
    .trim();
}

/**
 * Generate unique slug by checking database
 * Appends timestamp if slug already exists
 */
export async function generateUniqueSlug(title: string): Promise<string> {
  const supabase = createServerClient();
  let slug = generateSlug(title);
  
  const { data: existingGig } = await supabase
    .from('gigs')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();
  
  if (existingGig) {
    slug = `${slug}-${Date.now()}`;
  }
  
  return slug;
}

/**
 * Transform gig_dates into calendarMonths format for frontend
 */
export function transformCalendarMonths(gigDates: Array<{ month: string; days: string }>) {
  const monthsMap = new Map();
  
  gigDates.forEach(({ month, days }) => {
    // Parse "Sep 2025" → { month: 8, year: 2025 }
    const [monthName, year] = month.split(' ');
    const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth();
    
    // Parse "1-5, 10, 15-20" → [1,2,3,4,5,10,15,16,17,18,19,20]
    const dayNumbers: number[] = [];
    days.split(',').forEach(range => {
      range = range.trim();
      if (range.includes('-')) {
        const [start, end] = range.split('-').map(Number);
        for (let d = start; d <= end; d++) {
          dayNumbers.push(d);
        }
      } else {
        dayNumbers.push(Number(range));
      }
    });
    
    const key = `${year}-${monthIndex}`;
    if (monthsMap.has(key)) {
      monthsMap.get(key).highlightedDays.push(...dayNumbers);
    } else {
      monthsMap.set(key, {
        month: monthIndex,
        year: Number(year),
        highlightedDays: dayNumbers
      });
    }
  });
  
  return Array.from(monthsMap.values()).map(cal => ({
    ...cal,
    highlightedDays: [...new Set(cal.highlightedDays)].sort((a, b) => a - b)
  }));
}

/**
 * Check if user profile is complete
 * Returns profile completeness status
 */
export async function checkProfileComplete(userId: string): Promise<{ isComplete: boolean; percentage: number }> {
  const supabase = createServerClient();
  
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('profile_completion_percentage')
    .eq('id', userId)
    .maybeSingle();
  
  if (!profile) {
    return { isComplete: false, percentage: 0 };
  }
  
  const percentage = profile.profile_completion_percentage || 0;
  return { isComplete: percentage >= 80, percentage };
}

/**
 * Format budget label from amount and currency
 */
export function formatBudgetLabel(amount: number | null, currency: string, requestQuote: boolean): string {
  if (requestQuote) {
    return 'Request quote';
  }
  if (!amount) {
    return 'Not specified';
  }
  return `${currency} ${amount.toLocaleString()}`;
}
