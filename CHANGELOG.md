# Changelog - CourseNotes AI

## [1.0.1] - 2026-01-14

### Changed
- 🚀 **Upgraded to Claude Sonnet 4.5** (from Sonnet 4)
  - Model ID: `claude-sonnet-4-5-20250929`
  - Better reasoning for educational content
  - More accurate QCM generation
  - Improved markdown formatting
  - Files updated:
    - `lib/ai/claude.ts` (lines 32, 75)
    - `README.md`
    - `SPEC_FUNCTIONAL_CourseNotesAI.md`
    - `STATUS.md`

### Benefits
- ✅ **Better quality notes** with improved structure
- ✅ **More accurate QCM questions** with better explanations
- ✅ **Faster response times** (Sonnet 4.5 is optimized)
- ✅ **Same pricing** as Sonnet 4

### Technical Details
- **Previous model**: `claude-sonnet-4-20250514`
- **New model**: `claude-sonnet-4-5-20250929`
- **Context window**: 200K tokens (unchanged)
- **Max output**: 16K tokens (unchanged)
- **API compatibility**: 100% backward compatible

---

## [1.0.0] - 2026-01-14

### Added
- 🎉 Initial release of CourseNotes AI
- ✅ Full-stack Next.js 14 application
- ✅ Claude AI integration for notes + QCM generation
- ✅ Replicate integration for visual generation
- ✅ Supabase database with 7 tables
- ✅ Interactive QCM with 4 modes (intro/taking/results/review)
- ✅ Public gallery with filters
- ✅ Vote system
- ✅ PDF/DOCX/Image parsing
- ✅ Markdown + LaTeX rendering
- ✅ Complete documentation (README, QUICKSTART, ARCHITECTURE)

### Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS v3 + shadcn/ui
- Supabase (PostgreSQL + Storage)
- Claude Sonnet 4 (now 4.5)
- Replicate (Ideogram v3 Turbo)

---

## Notes for Users

### If you haven't deployed yet
✅ **No action needed** - The code already uses Sonnet 4.5

### If already deployed
1. No code changes needed (already updated)
2. Your existing Claude API keys will work with Sonnet 4.5
3. No migration required
4. Pricing remains the same:
   - $3 / 1M input tokens
   - $15 / 1M output tokens

### Testing the Upgrade
When you generate your next note, you'll automatically use Claude Sonnet 4.5. You should notice:
- Better structured markdown
- More accurate quiz questions
- More detailed explanations
- Slightly faster generation times

---

**Questions?** Refer to [README.md](README.md) or [QUICKSTART.md](QUICKSTART.md)
