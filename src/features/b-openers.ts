// The five companion openers, translated for "Speak our language" (Batch B).
// English falls back to each companion's own opener (src/lib/companions.ts).
// Pidgin lines ship. Yorùbá, Igbo and Hausa openers are UNREVIEWED drafts (COO review 20 Oct:
// some lines were wrong, e.g. 'iyà' = suffering, not hurry). They are NOT shown until a native
// speaker has checked them; until then the English opener shows and companions still reply in
// the chosen language. Move a language into TRANSLATIONS only after review.
import { getCompanion } from '../lib/companions'
import { loadLang, type BabelLang } from './b-prefs'

const TRANSLATIONS: Partial<Record<Exclude<BabelLang, 'en'>, Record<string, string>>> = {
  pcm: {
    sola: 'I dey here, and no rush at all. Wetin dey your mind today?',
    kemi: 'Make we untangle am together. Wetin be the main thing wey dey your mind now?',
    tobi: 'Hey, I glad say you come. How today treat you so?',
    amara: 'Make we slow down small-small. Breathe easy one time with me. How you dey feel right now?',
    dayo: 'I go talk true with you, but with love. Wetin really dey happen?',
  },
}

// Drafts awaiting a native speaker. Not used by the app.
export const OPENER_DRAFTS_TO_REVIEW: Record<string, Record<string, string>> = {
  yo: {
    sola: 'Mo wà níbí, kò sí iyà rárá. Kí ni ó wà lórí ọkàn rẹ òní?',
    kemi: 'Jẹ́ ká ṣiṣẹ́ pọ̀. Kí ni ohun pàtàkì tí ó wà lórí ọkàn rẹ báyìí?',
    tobi: 'Mo dùn láti rí ẹ. Báwo ni òní ṣe rí?',
    amara: 'Jẹ́ ká dèrú dèdíẹ̀ fún ìgbà díẹ̀. Mu ẹ̀mí kan pẹ̀lú mi. Báwo ni ìwọ ṣe ń ṣe báyìí?',
    dayo: 'Mo máa sọ òtítọ pẹ̀lú àáfẹ̀ẹ́ní. Kí ló ń ṣẹlẹ̀ gan-an?',
  },
  ig: {
    sola: 'Anọ m ebe a, ọ nweghị ọsọ ọsọ. Gịnị ka ị na-eche taa?',
    kemi: 'Ka anyị mepee ya ọnụ. Gịnị bụ ihe kachasị mkpa n’obi gị ugbu a?',
    tobi: 'Obi dị m ụtọ na ị nọ ebe a. Kedu ka taa si gaa?',
    amara: 'Ka anyị jiri nwayọọ obere oge. Were otu ume dị mma ya m. Kedu ka ị na-eme ugbu a?',
    dayo: 'M ga-ekwu eziokwu na ọmịiko. Kedu ihe na-eme n’ezie?',
  },
  ha: {
    sola: 'Ina nan, babu gaggawa. Mene kake tunani a yau?',
    kemi: 'Mu yayyafa shi tare. Mene ne mafi muhimmanci a zuciyarka a yanzu?',
    tobi: 'Na yi farin ciki da ka. Yau ya yi maka yaya?',
    amara: 'Mu dau hankali kaɗan. Yi numfashi guda tare da ni. Kaf yake ji a yanzu?',
    dayo: 'Zan faɗa maka gaskiya da tausayi. Mene ake faruwa a gaske?',
  },
}

// The opener shown in Chat for the current companion in the chosen language.
export function translatedOpener(companionId: string): string {
  const lang = loadLang()
  if (lang === 'en') return getCompanion(companionId).opener
  return TRANSLATIONS[lang]?.[companionId] ?? getCompanion(companionId).opener
}