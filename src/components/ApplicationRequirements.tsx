interface ApplicationRequirementsProps {
  jobId: string;
}

const ApplicationRequirements = ({ jobId }: ApplicationRequirementsProps) => {
  const requiresPortfolio = jobId === "desainer-grafis";

  return (
    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 md:p-5 rounded-lg">
      <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-3 flex items-center gap-2">
        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Dokumen yang Diperlukan
      </h2>
      <ul className="space-y-2 md:space-y-3">
        <li className="flex items-start gap-2 md:gap-3">
          <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
          <span className="text-xs md:text-sm text-gray-700 leading-relaxed">
            <strong>CV/Resume:</strong> Sertakan CV lengkap dengan pengalaman kerja dan pendidikan
          </span>
        </li>
        {requiresPortfolio && (
          <>
            <li className="flex items-start gap-2 md:gap-3">
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
              <span className="text-xs md:text-sm text-gray-700 leading-relaxed">
                <strong>Portofolio:</strong> <span className="text-red-600 font-semibold">Wajib dilampirkan!</span> Kirim portofolio desain Anda yang menunjukkan kemampuan layout design. Format: PDF, Link Google Drive/Behance/Dribbble, atau file gambar (JPG/PNG)
              </span>
            </li>
            <li className="flex items-start gap-2 md:gap-3">
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
              <span className="text-xs md:text-sm text-gray-700 leading-relaxed">
                <strong>Catatan:</strong> Pastikan portofolio mudah diakses dan menampilkan contoh karya terbaik Anda
              </span>
            </li>
          </>
        )}
      </ul>
    </div>
  );
};

export default ApplicationRequirements;

