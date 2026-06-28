with open('src/App.jsx', 'r') as f:
    content = f.read()

workflow_section = '''    },
    {
      title: 'Workflow',
      icon: ArrowUpRight,
      color: 'text-sky-600',
      bg: 'bg-sky-100',
      content: (
        <div className="space-y-4 text-sm leading-relaxed text-gray-600">
          <p>
            This walkthrough shows the complete lifecycle of a tour using a <strong className="text-gray-900">real example</strong>
            with 8 friends. Follow along to understand how each feature connects.
          </p>

          <div className="rounded-xl border border-sky-100 bg-sky-50 p-4">
            <p className="mb-2 text-xs font-bold text-sky-800">🧑 The Tour Group</p>
            <div className="grid grid-cols-2 gap-1 text-xs text-sky-700">
              <span>Abir (Manager)</span><span>Rahim</span>
              <span>Karim</span><span>Hasan</span>
              <span>Fatima</span><span>Ayesha</span>
              <span>Sumaiya</span><span>Jibon</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-xl border-l-4 border-indigo-400 bg-white px-3 py-2.5 shadow-sm">
              <p className="mb-1 text-xs font-bold text-indigo-700">Step 1: Record Expenses</p>
              <p className="text-xs text-gray-600">
                Abir pays for group expenses — house rent (24,000), food (4,500 + 1,600 + 5,600),
                travel (6,400 + 3,200), and miscellaneous (2,000 + 8,000).
                <strong> Total: ৳55,300.00</strong>
              </p>
              <p className="mt-1 text-[10px] text-gray-400">
                → Expenses tab → Add Expense → Fill date, category, description, amount, who paid
              </p>
            </div>

            <div className="rounded-xl border-l-4 border-emerald-400 bg-white px-3 py-2.5 shadow-sm">
              <p className="mb-1 text-xs font-bold text-emerald-700">Step 2: Record Advances</p>
              <p className="text-xs text-gray-600">
                Members give Abir advance money: Rahim (5,000 via bKash), Karim (3,000 Cash),
                Fatima (4,000 Nagad), Hasan (2,000 Cash).
                <strong> Total: ৳14,000.00</strong>
              </p>
              <p className="mt-1 text-[10px] text-gray-400">
                → Advances tab → Add Advance → Select person, amount, method, optional notes
              </p>
            </div>

            <div className="rounded-xl border-l-4 border-rose-400 bg-white px-3 py-2.5 shadow-sm">
              <p className="mb-1 text-xs font-bold text-rose-700">Step 3: Record Contributions</p>
              <p className="text-xs text-gray-600">
                Abir pays for specific individuals: Rahim's train upgrade (800), Sumaiya's souvenir (1,200),
                Jibon's entry fee (1,500), Ayesha's rickshaw (600).
                <strong> Total: ৳4,100.00</strong>
              </p>
              <p className="mt-1 text-[10px] text-gray-400">
                → Contributions tab → Add Contribution → Person, amount, reason why
              </p>
            </div>

            <div className="rounded-xl border-l-4 border-amber-400 bg-white px-3 py-2.5 shadow-sm">
              <p className="mb-1 text-xs font-bold text-amber-700">Step 4: Dashboard Overview</p>
              <p className="text-xs text-gray-600">
                See live stats: total expenses (55,300), advances received (14,000), net spending (41,300),
                and how many people owe Abir. View category breakdown and latest activity.
              </p>
              <p className="mt-1 text-[10px] text-gray-400">
                → Dashboard tab → Stat cards, Today's Activity, Latest Activity, Category Breakdown
              </p>
            </div>

            <div className="rounded-xl border-l-4 border-purple-400 bg-white px-3 py-2.5 shadow-sm">
              <p className="mb-1 text-xs font-bold text-purple-700">Step 5: Settlement Calculation</p>
              <p className="text-xs text-gray-600">
                Each person's share = 55,300 ÷ 8 = <strong>৳6,912.50</strong>.<br />
                Balance = Share − (Advances + Contributions + Direct Payments).<br />
                Result: 7 people owe Abir amounts ranging from 1,112 to 6,312.<br />
                <strong>Net for Abir: Collect ৳48,387.50</strong>
              </p>
              <p className="mt-1 text-[10px] text-gray-400">
                → Settlement tab → View balance table → Payment instructions
              </p>
            </div>

            <div className="rounded-xl border-l-4 border-teal-400 bg-white px-3 py-2.5 shadow-sm">
              <p className="mb-1 text-xs font-bold text-teal-700">Step 6: Download Summary</p>
              <p className="text-xs text-gray-600">
                Tap <strong>Make Settlement</strong> → review pending items → <strong>Settle Anyway</strong> →
                Download as PNG or PDF to share with all members for full transparency.
              </p>
              <p className="mt-1 text-[10px] text-gray-400">
                → Summary includes: all expenses, advances, contributions, balances, and payment instructions
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-gradient-to-r from-indigo-50 to-sky-50 p-3 text-xs text-gray-600">
            <p className="font-semibold text-gray-900">📊 Data Flow:</p>
            <p className="mt-1">
              <strong>Expenses</strong> → Split equally among 8 → Each person's <strong>Share</strong> —
              <strong>Advances</strong> + <strong>Contributions</strong> + <strong>Direct Payments</strong> = <strong>Balance</strong> →
              Payment Instructions → Settlement Summary
            </p>
          </div>

          <p className="rounded-xl bg-gray-50 px-3 py-2 text-xs text-gray-500">
            💡 For the full detailed example, see <strong>WORKFLOW.md</strong> in the project root.
          </p>
        </div>
      ),
    },
    {
      title: 'Quick Tips',
      icon: CheckCircle2,
      color: 'text-teal-600',
      bg: 'bg-teal-100',
'''

old = '''    },
    {
      title: 'Quick Tips',
      icon: CheckCircle2,
      color: 'text-teal-600',
      bg: 'bg-teal-100',
'''

if workflow_section in content:
    print('ERROR: Workflow section already exists!')
else:
    content = content.replace(old, workflow_section, 1)
    with open('src/App.jsx', 'w') as f:
        f.write(content)
    print('Workflow section inserted successfully!')
