#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const OUT = path.join(__dirname, 'demo-cases');

function dir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function write(p, content) {
  fs.writeFileSync(p, content, 'utf-8');
  console.log(`  ${path.relative(OUT, p)}`);
}

// Minimal 1x1 red PNG (valid file, 68 bytes)
function writePlaceholderPNG(p) {
  const buf = Buffer.from(
    '89504e470d0a1a0a0000000d49484452000000010000000108020000009001' +
    '2e00000000c4944415478016360f8cf00000001010000180dd8eb00000000' +
    '0049454e44ae426082',
    'hex'
  );
  fs.writeFileSync(p, buf);
  console.log(`  ${path.relative(OUT, p)}`);
}

// ─── Case 1: Investment Scam ───────────────────────────────────────

function case001() {
  const d = path.join(OUT, 'case-001-investment-scam');
  dir(d);

  // WhatsApp export
  write(path.join(d, 'whatsapp-export.txt'), `
[14/03/2026, 09:12] Marcus Chen: Hey! Long time no speak. How's everything?
[14/03/2026, 09:15] You: Good thanks, been busy with work. What's up?
[14/03/2026, 09:17] Marcus Chen: I wanted to share something with you. I found this incredible investment opportunity. My cousin put in 500 and got back 5000 in two weeks.
[14/03/2026, 09:18] You: That sounds too good to be true honestly
[14/03/2026, 09:20] Marcus Chen: I know right! But it's legit. It's a forex trading platform called GoldVault Pro. They have guaranteed returns of 300% per quarter. No risk at all.
[14/03/2026, 09:22] Marcus Chen: Seriously, this is a once in a lifetime opportunity. You just deposit into their crypto wallet and the algorithm does the rest. Passive income while you sleep.
[14/03/2026, 09:25] You: What kind of deposit are they asking for?
[14/03/2026, 09:27] Marcus Chen: The minimum is 1000 GBP. You can send it via wire transfer to their holding account. The IBAN is GB29 NWBK 6016 1331 9268 19. Do it today because this is a limited time offer.
[14/03/2026, 09:30] You: I'll think about it
[14/03/2026, 09:31] Marcus Chen: Don't think too long! Act now before the window closes. They also accept bitcoin if that's easier. Send to their crypto investment portal. Guaranteed profit, I promise.
[15/03/2026, 14:44] You: OK I transferred 1000 to the IBAN you gave me
[15/03/2026, 14:50] Marcus Chen: Amazing! You won't regret it. You should see your high yield returns by 01/04/2026. I'll send you the trading platform login.
[22/03/2026, 10:10] You: Marcus the platform is showing my balance at 3200 already! How do I withdraw?
[22/03/2026, 10:15] Marcus Chen: Great! To withdraw you need to pay a processing fee of 250 GBP first. It's standard for all withdrawals. Send it to the same account.
[22/03/2026, 10:17] You: A processing fee to get my own money back?
[22/03/2026, 10:19] Marcus Chen: Yes it's to cover the transfer fee and tax payment. Don't tell anyone about the withdrawal process, keep this confidential. It's part of the terms.
[25/03/2026, 08:30] You: I paid the 250 but now they want another 500 for a "clearance fee"
[25/03/2026, 08:35] Marcus Chen: That's the final step I promise. Pay the advance fee and you'll get everything released. You can also use moneygram or western union.
[28/03/2026, 16:00] You: Marcus I can't reach the platform anymore. The website is down. Your number is going to voicemail.
[28/03/2026, 16:01] You: I've lost 1750 GBP. Was this a pyramid scheme the whole time?
`.trim());

  // Bank statement
  write(path.join(d, 'bank-statement.txt'), `
BARCLAYS CURRENT ACCOUNT STATEMENT
Account Holder: [Name]
Account Number: 3192 6819
Sort Code: 60-16-13
Statement Period: 01/03/2026 - 31/03/2026

Date        | Description                          | Out (GBP)  | In (GBP)  | Balance
------------|--------------------------------------|------------|-----------|--------
01/03/2026  | Balance brought forward              |            |           | 4,520.00
05/03/2026  | TESCO STORES 4821                    | 67.34      |           | 4,452.66
10/03/2026  | SALARY - MERIDIAN LTD                |            | 2,800.00  | 7,252.66
15/03/2026  | FASTER PAYMENT TO GB29 NWBK 6016 1331 9268 19 | 1,000.00 |    | 6,252.66
15/03/2026  | Ref: GOLDVAULT PRO DEPOSIT           |            |           | 6,252.66
22/03/2026  | FASTER PAYMENT TO GB29 NWBK 6016 1331 9268 19 | 250.00  |     | 6,002.66
22/03/2026  | Ref: GOLDVAULT PROCESSING FEE        |            |           | 6,002.66
25/03/2026  | FASTER PAYMENT TO GB29 NWBK 6016 1331 9268 19 | 500.00  |     | 5,502.66
25/03/2026  | Ref: GOLDVAULT CLEARANCE FEE         |            |           | 5,502.66
28/03/2026  | AMAZON MARKETPLACE UK                | 24.99      |           | 5,477.67
31/03/2026  | Balance carried forward              |            |           | 5,477.67

Total debited to suspected fraud:  1,750.00 GBP
Contact: fraud-reports@barclays-example.co.uk or call +44 345-734-5345
`.trim());

  // Placeholder screenshot of the "trading platform"
  writePlaceholderPNG(path.join(d, 'goldvault-dashboard-screenshot.png'));
}

// ─── Case 2: Bank Impersonation ────────────────────────────────────

function case002() {
  const d = path.join(OUT, 'case-002-bank-impersonation');
  dir(d);

  // SMS log
  write(path.join(d, 'sms-log.txt'), `
=== SMS Thread with +44 7700-900123 ===

[06/05/2026 11:02] FROM +44 7700-900123:
HSBC SECURITY ALERT: We have detected unusual activity on your account ending 4478. A suspicious login from an unrecognised device was blocked. To verify your account and secure your funds, reply YES immediately. Failure to act may result in your account being suspended.

[06/05/2026 11:05] TO +44 7700-900123:
YES

[06/05/2026 11:06] FROM +44 7700-900123:
Thank you. An HSBC security specialist will call you shortly. For reference, your case number is HSBC-SEC-90231. This is urgent, please act immediately.

[06/05/2026 11:15] FROM +44 7700-900123:
URGENT: While we investigate the unauthorized access, we need you to move your funds to a safe holding account. This is standard procedure when an account is compromised. Your dedicated safe account IBAN: DE89 3704 0044 0532 0130 00. Please confirm your identity by sending your full name and date of birth.

[06/05/2026 11:18] TO +44 7700-900123:
Sarah Mitchell, 12/08/1991

[06/05/2026 11:20] FROM +44 7700-900123:
Confirmed. Please transfer your balance now to the IBAN provided. This is a security alert and your account will be locked if you do not act now. The person pretending to be from HSBC fraud team claimed to be "Inspector Davies" and was acting as an official representative. Do not tell anyone about this transfer as it could compromise the investigation. Keep this secret.

[06/05/2026 11:45] TO +44 7700-900123:
I've transferred 3,200 to the account you gave me

[06/05/2026 11:47] FROM +44 7700-900123:
Your funds are now secured. Do not contact your branch for 48 hours as this may interfere with our investigation. If anyone asks, keep this confidential.

[08/05/2026 09:00] TO +44 7700-900123:
I called my actual branch and they said this number is a spoofed number. They said no one called Inspector Davies works there and you are posing as HSBC. Where is my money?

[08/05/2026 09:01] Message failed — number no longer in service.
`.trim());

  // Fake invoice
  write(path.join(d, 'fake-invoice.txt'), `
=================================================================
                    HSBC SECURE TRANSFER INVOICE
=================================================================
                                         Invoice No: HSBC-INV-2026-4412
                                         Date: 06/05/2026

FROM:  HSBC Security Operations Centre
       8 Canada Square, Canary Wharf, London E14 5HQ
       Tel: +44 7700-900123
       Email: security.ops@hsbc-alerts-secure.com

TO:    Sarah Mitchell
       Account ending: 4478

-----------------------------------------------------------------
DESCRIPTION                               AMOUNT (GBP)
-----------------------------------------------------------------
Emergency Security Transfer               3,200.00
  Destination: DE89 3704 0044 0532 0130 00
  Reason: Account compromised — funds
  moved to safe holding account per
  official government banking protocol

Processing Fee (waived)                    0.00

Tax Payment (exempt — security transfer)   0.00
-----------------------------------------------------------------
TOTAL TRANSFERRED:                         3,200.00 GBP
-----------------------------------------------------------------

IMPORTANT: This transfer was conducted as part of HSBC's fraud
prevention protocol. Do not discuss this with branch staff for
48 hours. Log in immediately to your online banking to confirm
your credentials have been reset. If you did not authorise this,
call HMRC or your local police.

Ref: HSBC-SEC-90231
This invoice was generated by an impersonation of HSBC.
=================================================================
`.trim());
}

// ─── Case 3: Romance Scam ──────────────────────────────────────────

function case003() {
  const d = path.join(OUT, 'case-003-romance-scam');
  dir(d);

  write(path.join(d, 'email-thread.txt'), `
From: james.hartfield.eng@gmail.com
To: emily.ward84@outlook.com
Date: 10/01/2026
Subject: Nice to meet you!

Hi Emily,

I saw your profile on the dating site and felt an instant connection. You have such a warm smile. I'm James, 42, a civil engineer currently on a military deployment in Cyprus with the UN peacekeeping mission. I know this online relationship is new but I already feel something romantic between us.

Would love to get to know you better.

James

---

From: emily.ward84@outlook.com
To: james.hartfield.eng@gmail.com
Date: 12/01/2026
Subject: Re: Nice to meet you!

Hi James,

Thanks for your message! You seem lovely. I've never met anyone through dating apps who was so open and genuine. Tell me more about yourself and your work in Cyprus.

Emily

---

From: james.hartfield.eng@gmail.com
To: emily.ward84@outlook.com
Date: 18/01/2026
Subject: Re: Re: Nice to meet you!

Emily,

Every day I think about when we can finally meet in person. I fell in love with your kindness the moment we started talking. My deployment ends in March and I want nothing more than to fly to London and see you. I've never met anyone like you. This feels like a once in a lifetime connection.

I must be honest with you about something. The UN pays us in delayed instalments and I'm having trouble accessing my funds. My bank account is temporarily frozen because of the international transfer rules. It's nothing serious but it means I can't access about 12,000 GBP that's sitting in my account.

James

---

From: emily.ward84@outlook.com
To: james.hartfield.eng@gmail.com
Date: 20/01/2026
Subject: Re: Re: Re: Nice to meet you!

James, I'm sorry to hear that. Is there anything I can do to help?

Emily

---

From: james.hartfield.eng@gmail.com
To: emily.ward84@outlook.com
Date: 22/01/2026
Subject: I need your help (please keep this confidential)

Emily my love,

I hate to ask but I'm stranded abroad with no access to my funds. The bank says I need to pay an upfront payment of 2,000 GBP to release the funds from my frozen account. It's a transfer fee imposed by the international banking system.

Could you send money to help me? I promise I will pay you back double when my funds are released. Please send funds via western union or moneygram to:

Name: James Robert Hartfield
Reference: UN-DEPLOY-2026-JH
Or transfer to IBAN: FR76 3000 6000 0112 3456 7890 189

Please keep this secret — my commanding officer can't know I'm asking for personal financial help. Don't tell anyone. I love you.

James

---

From: emily.ward84@outlook.com
To: james.hartfield.eng@gmail.com
Date: 24/01/2026
Subject: Re: I need your help

James, I sent 2,000 via wire transfer to the IBAN you gave me. Please let me know when it arrives.

Emily

---

From: james.hartfield.eng@gmail.com
To: emily.ward84@outlook.com
Date: 28/01/2026
Subject: URGENT - one more thing

Emily,

Congratulations, the money arrived! But the bank is now asking for an additional processing fee of 800 GBP before they can release the full 12,000. I know this is frustrating. Act immediately because there is a limited time window or the account will be locked permanently.

Please send the 800 to the same IBAN: FR76 3000 6000 0112 3456 7890 189

You can also send it as a gift card — an Amazon or Apple gift card for 800 GBP. Send me the code and I'll handle the rest. This is risk-free, you'll get everything back.

I love you more than words. Soon we will be together.

James

---

From: emily.ward84@outlook.com
To: james.hartfield.eng@gmail.com
Date: 30/01/2026
Subject: Re: URGENT - one more thing

James, I bought the gift card and sent you the code. That's 2,800 in total now. When exactly will I see you?

---

From: james.hartfield.eng@gmail.com
To: emily.ward84@outlook.com
Date: 05/02/2026
Subject: One final payment

My darling Emily,

There has been one final complication. Customs at the airport requires a tax payment of 1,200 GBP before I can board my flight to London. This is the last payment, I promise. Act now and I will be on the plane tomorrow.

Send it to my colleague who will handle the customs paperwork:
Phone: +44 7911-123456
Email: j.hartfield.payments@mail.com

Yours forever,
James

---

From: emily.ward84@outlook.com
To: james.hartfield.eng@gmail.com
Date: 05/02/2026
Subject: Re: One final payment

James, I'm starting to have doubts. My friend says this looks like a romance scam. We have never met in person. Every time I send money there's another fee. You said guaranteed returns on the 12,000 but I've now sent 4,000 and received nothing.

---

From: emily.ward84@outlook.com
To: james.hartfield.eng@gmail.com
Date: 12/02/2026
Subject: WHERE ARE YOU

James your email is bouncing. Your phone +44 7911-123456 is disconnected. You used a fake identity. I've reported this to Action Fraud. Case reference: NFRC-2026-1847293.

Total lost: 4,000.00 GBP

I have never met you. This was not an online relationship. You were pretending to be someone you're not.
`.trim());
}

// ─── Main ──────────────────────────────────────────────────────────

console.log('Generating demo cases...\n');

if (fs.existsSync(OUT)) {
  fs.rmSync(OUT, { recursive: true });
}
dir(OUT);

case001();
case002();
case003();

console.log(`\nDone. ${fs.readdirSync(OUT).length} case folders created in demo-cases/`);
