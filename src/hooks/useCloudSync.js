/*
 * Supabase table schema — run this in the Supabase SQL Editor:
 *
 * create table cvs (
 *   id uuid default gen_random_uuid() primary key,
 *   user_id uuid references auth.users not null,
 *   cv_id text not null,
 *   name text not null,
 *   template text not null default 'modern',
 *   last_edited timestamptz not null,
 *   data jsonb not null,
 *   unique(user_id, cv_id)
 * );
 * alter table cvs enable row level security;
 * create policy "Users can manage own CVs"
 *   on cvs for all
 *   using (auth.uid() = user_id)
 *   with check (auth.uid() = user_id);
 */

import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { loadAllCVs, saveAllCVs } from './useResumeData'

export function useCloudSync() {
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSynced, setLastSynced] = useState(null)

  /**
   * Pull all CVs for this user from Supabase and merge into localStorage.
   * Cloud records win for matching cv_id; local-only records are kept as-is.
   */
  const syncFromCloud = useCallback(async (userId) => {
    if (!supabase || !userId) return
    setIsSyncing(true)
    try {
      const { data, error } = await supabase
        .from('cvs')
        .select('*')
        .eq('user_id', userId)

      if (error) {
        console.error('[Supabase] syncFromCloud error:', error.message)
        return
      }

      if (!data || data.length === 0) {
        setLastSynced(new Date())
        return
      }

      const local = loadAllCVs() || {}

      for (const row of data) {
        local[row.cv_id] = {
          id: row.cv_id,
          name: row.name,
          template: row.template,
          lastEdited: row.last_edited,
          data: row.data,
        }
      }

      saveAllCVs(local)
      setLastSynced(new Date())
    } catch (err) {
      console.error('[Supabase] syncFromCloud unexpected error:', err)
    } finally {
      setIsSyncing(false)
    }
  }, [])

  /**
   * Push all CVs in localStorage up to Supabase (upsert by user_id + cv_id).
   */
  const syncToCloud = useCallback(async (userId, cvs) => {
    if (!supabase || !userId) return
    setIsSyncing(true)
    try {
      const rows = Object.values(cvs).map((cv) => ({
        user_id: userId,
        cv_id: cv.id,
        name: cv.name,
        template: cv.template || 'modern',
        last_edited: cv.lastEdited,
        data: cv.data,
      }))

      if (rows.length === 0) {
        setLastSynced(new Date())
        return
      }

      const { error } = await supabase
        .from('cvs')
        .upsert(rows, { onConflict: 'user_id,cv_id' })

      if (error) {
        console.error('[Supabase] syncToCloud error:', error.message)
        return
      }

      setLastSynced(new Date())
    } catch (err) {
      console.error('[Supabase] syncToCloud unexpected error:', err)
    } finally {
      setIsSyncing(false)
    }
  }, [])

  /**
   * Upsert a single CV to Supabase.
   */
  const saveCV = useCallback(async (userId, cv) => {
    if (!supabase || !userId || !cv) return
    try {
      const { error } = await supabase.from('cvs').upsert(
        {
          user_id: userId,
          cv_id: cv.id,
          name: cv.name,
          template: cv.template || 'modern',
          last_edited: cv.lastEdited,
          data: cv.data,
        },
        { onConflict: 'user_id,cv_id' }
      )
      if (error) {
        console.error('[Supabase] saveCV error:', error.message)
        return
      }
      setLastSynced(new Date())
    } catch (err) {
      console.error('[Supabase] saveCV unexpected error:', err)
    }
  }, [])

  /**
   * Delete a CV from Supabase by cv_id.
   */
  const deleteCloudCV = useCallback(async (userId, cvId) => {
    if (!supabase || !userId || !cvId) return
    try {
      const { error } = await supabase
        .from('cvs')
        .delete()
        .eq('user_id', userId)
        .eq('cv_id', cvId)

      if (error) {
        console.error('[Supabase] deleteCloudCV error:', error.message)
      }
    } catch (err) {
      console.error('[Supabase] deleteCloudCV unexpected error:', err)
    }
  }, [])

  return { isSyncing, lastSynced, syncFromCloud, syncToCloud, saveCV, deleteCloudCV }
}
