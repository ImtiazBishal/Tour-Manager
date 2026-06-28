# Tour Expense Tracker — Workflow Guide

This guide walks through a **real-world example** of using the Tour Expense Tracker, from start to finish.

---

## 🧑‍🤝‍🧑 The Scenario

**8 friends** go on a tour:

| Member | Role |
|--------|------|
| Abir | Tour Manager (pays for group expenses) |
| Rahim | Friend |
| Karim | Friend |
| Hasan | Friend |
| Fatima | Friend |
| Ayesha | Friend |
| Sumaiya | Friend |
| Jibon | Friend |

**Abir** (the manager) pays for most group expenses out of his own pocket. The other members give money back through **Advances** or **Contributions**.

---

## 📋 Step-by-Step Workflow

### Step 1: Record Expenses

Abir pays for various group expenses. He records each one on the **Expenses** page.

| Date | Category | Description | Amount (৳) | Paid By |
|------|----------|-------------|-------------|---------|
| 2026-06-01 | House Rent | June house rent payment | 24,000.00 | Abir |
| 2026-06-01 | Food | Dinner at Sultans Dine | 4,500.00 | Abir |
| 2026-06-02 | Travel Up | Bus tickets Dhaka→Sylhet | 6,400.00 | Abir |
| 2026-06-03 | Food | Breakfast at hotel | 1,600.00 | Abir |
| 2026-06-04 | Travel Down | CNG & bus return | 3,200.00 | Abir |
| 2026-06-05 | Miscellaneous | Photography pass at tea garden | 2,000.00 | Abir |
| 2026-06-06 | Food | Dinner at Panshi Restaurant | 5,600.00 | Abir |
| 2026-06-07 | House Rent | Extension night rent | 8,000.00 | Abir |

**Total Expenses: ৳55,300.00**

> **How to add an expense:**
> 1. Go to **Expenses** tab → Tap **Add Expense**
> 2. Fill in date, select a category (or create a new one with **➕ Add new category...**)
> 3. Enter description, amount (positive number only), and who paid
> 4. Tap **Add Expense**

---

### Step 2: Record Advances

Some members give Abir advance money toward their share. These are recorded on the **Advances** page.

| Date | Person | Amount (৳) | Method | Notes |
|------|--------|-------------|--------|-------|
| 2026-06-02 | Rahim | 5,000.00 | bKash | Sent to Abir's bKash |
| 2026-06-03 | Karim | 3,000.00 | Cash | Gave cash at hotel |
| 2026-06-05 | Fatima | 4,000.00 | Nagad | Sent via Nagad |
| 2026-06-06 | Hasan | 2,000.00 | Cash | Paid during dinner |

**Total Advances: ৳14,000.00**

> **How to add an advance:**
> 1. Go to **Advances** tab → Tap **Add Advance**
> 2. Select the person, enter amount, choose payment method (Cash/bKash/Nagad/Bank Transfer)
> 3. Add optional notes, tap **Add Advance**

---

### Step 3: Record Contributions

Abir sometimes pays for things on behalf of **specific individuals** (not group expenses). These are **Contributions**.

| Date | Person | Amount (৳) | Reason |
|------|--------|-------------|--------|
| 2026-06-02 | Rahim | 800.00 | Paid for Rahim's solo train upgrade |
| 2026-06-04 | Sumaiya | 1,200.00 | Bought souvenir on Sumaiya's behalf |
| 2026-06-05 | Jibon | 1,500.00 | Paid Jibon's tea garden entry fee |
| 2026-06-07 | Ayesha | 600.00 | Paid Ayesha's rickshaw fare back |

**Total Contributions: ৳4,100.00**

> **How to add a contribution:**
> 1. Go to **Contributions** tab → Tap **Add Contribution**
> 2. Select the person, enter amount, describe the reason
> 3. Tap **Add Contribution**

---

### Step 4: View the Dashboard

The **Dashboard** gives an overview of everything:

```
┌─────────────────────────────────────────────────────┐
│  Total Expenses    Advances Received   Net Spending  │
│  ৳55,300.00        ৳14,000.00         ৳41,300.00    │
│                                                     │
│  People Who Owe: 4                                   │
└─────────────────────────────────────────────────────┘
```

- **Today's Activity** shows any transactions recorded today
- **Latest Activity** shows the 3 most recent transactions across all types
- **Category Breakdown** shows a visual bar chart of expenses by category
- **Recent Expenses** lists the last 5 expenses with details
- **Balance Overview** shows each person's share vs what they've paid

---

### Step 5: Settlement & Final Calculation

When the tour ends, go to the **Settlement** page.

**The math:**
```
Total Expenses = ৳55,300.00
Per Person Share = ৳55,300.00 ÷ 8 = ৳6,912.50
```

**Each person's balance is calculated as:**

> **Balance = Expense Share − (Advances + Contributions + Direct Payments)**

Here's how each member's share breaks down:

| Member | Share (৳) | Advance (৳) | Contribution (৳) | Direct Paid (৳) | Total Paid (৳) | Balance (৳) |
|--------|-----------|-------------|-------------------|-----------------|----------------|-------------|
| Abir | 6,912.50 | 0.00 | 0.00 | 55,300.00 | 55,300.00 | **−48,387.50** (paid way more) |
| Rahim | 6,912.50 | 5,000.00 | 800.00 | 0.00 | 5,800.00 | **1,112.50** (owes) |
| Karim | 6,912.50 | 3,000.00 | 0.00 | 0.00 | 3,000.00 | **3,912.50** (owes) |
| Hasan | 6,912.50 | 2,000.00 | 0.00 | 0.00 | 2,000.00 | **4,912.50** (owes) |
| Fatima | 6,912.50 | 4,000.00 | 0.00 | 0.00 | 4,000.00 | **2,912.50** (owes) |
| Ayesha | 6,912.50 | 0.00 | 600.00 | 0.00 | 600.00 | **6,312.50** (owes) |
| Sumaiya | 6,912.50 | 0.00 | 1,200.00 | 0.00 | 1,200.00 | **5,712.50** (owes) |
| Jibon | 6,912.50 | 0.00 | 1,500.00 | 0.00 | 1,500.00 | **5,412.50** (owes) |

> **Note:** Abir paid ৳55,300.00 but his share is only ৳6,912.50. He's owed ৳48,387.50 by the others.

**Payment Instructions (who should pay whom):**

```
🔴 Rahim owes Abir:      ৳1,112.50
🔴 Karim owes Abir:      ৳3,912.50
🔴 Hasan owes Abir:      ৳4,912.50
🔴 Fatima owes Abir:     ৳2,912.50
🔴 Ayesha owes Abir:     ৳6,312.50
🔴 Sumaiya owes Abir:    ৳5,712.50
🔴 Jibon owes Abir:      ৳5,412.50

Net for Abir: Needs to collect ৳48,387.50 from others
```

---

### Step 6: Make Settlement & Download Summary

1. Tap **Make Settlement** on the Settlement page
2. If there are pending amounts, a modal shows what's still outstanding
3. Tap **Settle Anyway** to proceed
4. Download the **PNG** or **PDF** summary for sharing

The summary includes:
- Tour header with settlement date
- Total expenses and per-person share
- Full itemized list of all expenses, advances, and contributions
- Balance overview for each member
- Payment instructions (who pays whom)
- Complete member list

---

## 📊 Data Flow Diagram

```
Expenses
  │
  ▼
Expense Share = Total ÷ 8 (per person)
  │
  ▼
 Balance = Share − (Advances + Contributions + Direct Payments)
  │
  ├─ Positive (+) → Person owes Abir
  └─ Negative (−) → Abir owes person
  │
  ▼
Settlement → Payment Instructions → Download Summary
```

---

## 💡 Quick Tips

| Tip | Description |
|-----|-------------|
| **FAB Menu** | On mobile, tap the floating **+** button for quick access to Add Expense, Advance, Contribution, and Help |
| **Inline Add** | In any dropdown (Category, Person), select **➕ Add new...** to create on the fly without leaving the form |
| **Edit/Delete** | Tap the ✏️ pencil icon to edit a record, or 🗑️ trash icon to delete (with confirmation) |
| **Validations** | All forms validate: positive amounts only, max 2 decimal places, future dates rejected, descriptions 3–200 chars |
| **Dashboard Refresh** | Tap **Refresh** on the Dashboard to reload all data |
