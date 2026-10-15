import React from 'react';

export default function SignupStep2({ formData, setFormData, errors, onContinue, onSkip, isLoading }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (e) => {
    setFormData((prev) => ({ ...prev, emergencyContactPhone: e.target.value.replace(/\D/g, '').slice(0, 10) }));
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#2563EB]">Step 2</p>
        <h2 className="mt-2 font-headline text-3xl font-semibold text-[#0F172A]">Add your emergency contact</h2>
        <p className="mt-2 text-[#64748B]">Optional now. You can skip and complete this later from settings.</p>
      </div>

      <div className="rounded-[24px] border border-[#3B82F6]/40 bg-[#3B82F6]/10 p-5 text-sm text-[#0F172A]">
        This person will be notified during SOS events and safety sharing.
      </div>

      <div className="grid gap-5">
        <label className="block">
          <span className="premium-label">Contact name</span>
          <input name="emergencyContactName" value={formData.emergencyContactName} onChange={handleChange} className="premium-input" placeholder="Appa, Ammi, Behen..." />
          {errors.emergencyContactName && <p className="mt-2 text-sm text-[#C62828]">{errors.emergencyContactName}</p>}
        </label>

        <label className="block">
          <span className="premium-label">Contact phone</span>
          <input name="emergencyContactPhone" value={formData.emergencyContactPhone} onChange={handlePhoneChange} className="premium-input" placeholder="10-digit Indian number" />
          {errors.emergencyContactPhone && <p className="mt-2 text-sm text-[#C62828]">{errors.emergencyContactPhone}</p>}
        </label>

        <label className="block">
          <span className="premium-label">Relationship</span>
          <select
            name="emergencyContactRelationship"
            value={formData.emergencyContactRelationship}
            onChange={handleChange}
            className="premium-select bg-white text-[#0F172A] border-[#E2E8F0]"
          >
            <option value="" className="bg-white text-[#64748B]">Select relationship</option>
            <option value="Appa" className="bg-white text-[#0F172A]">Appa</option>
            <option value="Ammi" className="bg-white text-[#0F172A]">Ammi</option>
            <option value="Behen" className="bg-white text-[#0F172A]">Behen</option>
            <option value="Bhai" className="bg-white text-[#0F172A]">Bhai</option>
            <option value="Dost" className="bg-white text-[#0F172A]">Dost</option>
            <option value="Partner" className="bg-white text-[#0F172A]">Partner</option>
            <option value="Spouse" className="bg-white text-[#0F172A]">Spouse</option>
            <option value="Guardian" className="bg-white text-[#0F172A]">Guardian</option>
            <option value="Other" className="bg-white text-[#0F172A]">Other</option>
          </select>
        </label>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={onSkip} disabled={isLoading} className="btn-secondary flex-1 justify-center">
          Skip for now
        </button>
        <button type="button" onClick={onContinue} disabled={isLoading} className="btn-primary flex-1 justify-center">
          Save and continue
        </button>
      </div>
    </div>
  );
}
