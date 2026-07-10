import { Heart, Shield } from 'lucide-react'

export default function Disclaimer({ onAck }: { onAck: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F1EA] p-4">
      <div className="max-w-md w-full">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#8BA889] to-[#6B9BB5] flex items-center justify-center mb-4">
            <Heart size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#2C2C2C]">Mindspace</h1>
          <p className="text-sm text-[#6B6B6B] mt-1">Your private space for reflection and support</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <Shield size={18} className="text-amber-600" />
            </div>
            <div>
              <h2 className="font-semibold text-[#2C2C2C] mb-2">Please read before continuing</h2>
              <ul className="text-sm text-[#6B6B6B] space-y-2">
                <li>• Mindspace is <strong>not a replacement</strong> for professional therapy or medical care.</li>
                <li>• This is a supportive companion, not a licensed therapist.</li>
                <li>• If you're in crisis or having thoughts of self-harm, please contact a crisis hotline or emergency services.</li>
                <li>• All your data stays on your device — nothing is sent to a server (except your AI messages).</li>
                <li>• You can delete all your data at any time.</li>
              </ul>
            </div>
          </div>

          <button
            onClick={onAck}
            className="w-full py-3 rounded-xl bg-[#8BA889] text-white font-medium hover:bg-[#5F7A5E] transition-colors"
          >
            I understand — let's begin
          </button>
        </div>

        <p className="text-center text-xs text-[#6B6B6B] mt-4">
          If you need immediate help, call 988 (US) or your local emergency number.
        </p>
      </div>
    </div>
  )
}