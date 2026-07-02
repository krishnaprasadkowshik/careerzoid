export default function ReferralDashboardPage() {
  const referralCode =
    "CZ-DEMO-1234";

  const referralLink =
    `https://careerzoid.com/register?ref=${referralCode}`;

  const totalReferrals = 12;
  const successfulReferrals = 8;

  const referrals = [
    {
      name: "Rahul",
      status: "Successful",
      date: "2026-06-01",
    },
    {
      name: "Priya",
      status: "Pending",
      date: "2026-06-03",
    },
    {
      name: "Arjun",
      status: "Successful",
      date: "2026-06-05",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <div className="max-w-7xl mx-auto p-10">

        <h1 className="text-5xl font-bold mb-4">
          Referral Dashboard
        </h1>

        <p className="text-gray-400 mb-10">
          Grow the CareerZoid Community
        </p>

        <div className="grid md:grid-cols-3 gap-6 mb-10">

          <div className="bg-slate-900 rounded-2xl p-6">
            <h2 className="text-lg mb-2">
              Referral Code
            </h2>

            <p className="text-2xl font-bold text-green-400">
              {referralCode}
            </p>
          </div>

          <div className="bg-slate-900 rounded-2xl p-6">
            <h2 className="text-lg mb-2">
              Total Referrals
            </h2>

            <p className="text-2xl font-bold">
              {totalReferrals}
            </p>
          </div>

          <div className="bg-slate-900 rounded-2xl p-6">
            <h2 className="text-lg mb-2">
              Successful Referrals
            </h2>

            <p className="text-2xl font-bold text-purple-400">
              {successfulReferrals}
            </p>
          </div>

        </div>

        <div className="bg-slate-900 rounded-3xl p-8 mb-10">

          <h2 className="text-2xl font-bold mb-4">
            Referral Link
          </h2>

          <div className="bg-slate-800 rounded-xl p-4 break-all">
            {referralLink}
          </div>

        </div>

        <div className="bg-slate-900 rounded-3xl p-8">

          <h2 className="text-3xl font-bold mb-6">
            Referral History
          </h2>

          <div className="space-y-4">

            {referrals.map(
              (item, index) => (
                <div
                  key={index}
                  className="bg-slate-800 rounded-xl p-5 flex justify-between"
                >
                  <div>

                    <div className="font-bold">
                      {item.name}
                    </div>

                    <div className="text-gray-400">
                      {item.date}
                    </div>

                  </div>

                  <div>

                    {item.status ===
                    "Successful" ? (
                      <span className="bg-green-600 px-3 py-1 rounded-full">
                        Successful
                      </span>
                    ) : (
                      <span className="bg-yellow-600 px-3 py-1 rounded-full">
                        Pending
                      </span>
                    )}

                  </div>

                </div>
              )
            )}

          </div>

        </div>

      </div>

    </div>
  );
}