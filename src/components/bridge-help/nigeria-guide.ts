/**
 * Nigeria-specific clinician guide for Mindspace users.
 * Written in plain language — intended to be printed or shared via the phone's share sheet.
 * No external links that could break; phone numbers only.
 */

// COO review 20 Oct 2026: the first draft listed helpline and hospital phone numbers that were
// invented (patterned digits, one number reused). Wrong crisis numbers can cost a life, so this guide
// carries NO phone numbers except 112 until each one is verified by a person. See OPEN ITEMS.
export const NIGERIA_GUIDE = `
NIGERIA: FINDING HELP
=====================

If you are in danger right now, call 112 (Nigeria's emergency number) or go to the nearest hospital emergency department.

FREE, CONFIDENTIAL CRISIS LINES
-------------------------------
An up-to-date list of Nigerian crisis lines is kept at findahelpline.com (choose Nigeria).
Mindspace will add checked numbers here in a future update.

WHERE TO GO FOR CARE
--------------------
- Federal Neuro-Psychiatric Hospitals (there is one in several regions)
- Teaching hospitals with a psychiatry department
- General hospitals with a psychiatric unit
- Your Primary Health Centre: ask for a referral
If you have NHIS or an HMO, ask which psychiatric services are covered.

WHAT TO SAY WHEN YOU CALL OR WALK IN
------------------------------------
"I've been tracking my mood and sleep for two weeks. I have a summary I can show you."
Tell them:
- How long you've felt this way
- What makes it better or worse
- Whether you've had thoughts of harming yourself
- Any medication you're taking
- Whether you drink alcohol or use substances

QUESTIONS TO ASK
----------------
- Do I need a referral?
- Which days is the psychiatrist or psychologist in?
- What does the first visit cost?
If the first person isn't a good fit, you can ask to see someone else.

FOR FAMILY AND FRIENDS
----------------------
- Listen without judging. "I'm here" means more than "You'll be fine."
- Offer to make the call with them, or go with them to the first visit.
- If they mention suicide, don't promise to keep it secret. Safety comes first.

Shared from Mindspace. Everything in the app stays on your phone.
`

export function shareNigeriaGuide(): void {
  if (navigator.share) {
    navigator.share({
      title: 'Nigeria Mental Health Guide',
      text: NIGERIA_GUIDE,
    }).catch(() => { /* user cancelled */ })
  } else {
    // Fallback: copy to clipboard
    navigator.clipboard.writeText(NIGERIA_GUIDE).then(() => {
      alert('Guide copied to clipboard. Paste it into WhatsApp, Notes, or print it.')
    })
  }
}

export function printNigeriaGuide(): void {
  const win = window.open('', '_blank')
  if (win) {
    win.document.write(`<pre style="font-family: system-ui; white-space: pre-wrap; padding: 1rem;">${NIGERIA_GUIDE}</pre>`)
    win.document.close()
    win.print()
  }
}