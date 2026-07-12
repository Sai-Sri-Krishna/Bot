package com.nec.init;

import com.nec.faq.FaqAlias;
import com.nec.faq.FaqEntry;
import com.nec.faq.FaqRepository;
import com.nec.user.User;
import com.nec.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final FaqRepository faqRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.password}")
    private String adminPassword;

    @Value("${app.admin.name}")
    private String adminName;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        seedAdminUser();
        seedFaqEntries();
    }

    private void seedAdminUser() {
        if (!userRepository.existsByEmail(adminEmail)) {
            User admin = User.builder()
                    .name(adminName)
                    .email(adminEmail)
                    .passwordHash(passwordEncoder.encode(adminPassword))
                    .role("ADMIN")
                    .build();
            userRepository.save(admin);
            log.info("Seeded admin user: {}", adminEmail);
        }
    }

    private void seedFaqEntries() {
        if (faqRepository.count() > 0) {
            log.info("FAQ entries already seeded, skipping.");
            return;
        }

        List<FaqData> faqs = List.of(
                new FaqData("What is your name?",
                        "Hey there! I'm the NEC virtual assistant. What can I help you with today?", "Admissions",
                        List.of("Who are you?", "What's your name", "Hey", "Hello")),
                new FaqData("What can you do?",
                        "I can help you out with pretty much anything admissions-related — eligibility, fees, courses, how the application process works, you name it.",
                        "Admissions",
                        List.of("How can you help me?", "What do you support?")),
                new FaqData("What is NEC?",
                        "NEC stands for Narasaraopeta Engineering College. It's an autonomous college that's been around since 1998, based in Narasaraopet, Andhra Pradesh. It's affiliated with JNTUK Kakinada, approved by AICTE, and it holds an A+ grade from NAAC.",
                        "Campus & Support",
                        List.of("Tell me about NEC", "What is Narasaraopeta Engineering College?",
                                "About the college")),
                new FaqData("Where is NEC located?",
                        "We're located on Kotappakonda Road in Narasaraopet, in Guntur District, Andhra Pradesh.",
                        "Campus & Support",
                        List.of("NEC address", "Where is the college?", "Campus location")),
                new FaqData("What is the eligibility for B.Tech admission?",
                        "You'll need to have finished your 10 plus 2 with at least 45% overall, and Physics and Math need to be part of your subjects.",
                        "Courses",
                        List.of("B.Tech eligibility", "Can I apply for B.Tech?", "Minimum marks for B.Tech")),
                new FaqData("What is the eligibility for M.Tech admission?",
                        "You'll need a B.E. or B.Tech in a relevant field from a recognized university, with at least 50% marks.",
                        "Courses",
                        List.of("M.Tech eligibility", "Can I apply for M.Tech?", "Minimum marks for M.Tech")),
                new FaqData("What is the eligibility for MBA admission?",
                        "Any bachelor's degree works, as long as you've got at least 50% marks.", "Courses",
                        List.of("MBA eligibility", "Can I apply for MBA?", "Minimum marks for MBA")),
                new FaqData("What is the eligibility for MCA admission?",
                        "You'll need a bachelor's degree with at least 50%, and you should've had Math back in your 10 plus 2.",
                        "Courses",
                        List.of("MCA eligibility", "Can I apply for MCA?", "Minimum marks for MCA")),
                new FaqData("Can diploma holders join B.Tech directly into second year?",
                        "That's usually possible through lateral entry via ECET, but let me connect you with the admissions office so they can confirm seats for your specific branch.",
                        "Admissions",
                        List.of("Lateral entry admission", "Diploma to B.Tech", "ECET admission")),
                new FaqData("How are B.Tech seats allotted?",
                        "So, about 70% of the seats go through AP EAPCET counselling based on your rank, and the other 30% are filled directly by the college through what's called the management quota, based on your 10 plus 2 marks.",
                        "Quota & Fees",
                        List.of("B.Tech seat allotment", "How are BTech admissions done?",
                                "How do I get a seat in B.Tech?")),
                new FaqData("How are M.Tech seats allotted?",
                        "It's similar to B.Tech — 70% through GATE or PGECET counselling, and the remaining 30% under management quota based on your B.Tech marks.",
                        "Quota & Fees",
                        List.of("M.Tech seat allotment", "How are MTech admissions done?")),
                new FaqData("How are MBA and MCA seats allotted?",
                        "70% of seats come through APICET counselling, and the other 30% are under management quota, based on your qualifying exam marks.",
                        "Quota & Fees",
                        List.of("MBA seat allotment", "MCA seat allotment", "How are MBA MCA admissions done?")),
                new FaqData("What is B-Category admission?",
                        "B-Category is just another name for the management quota. It's the 30% of seats the college fills directly, based on merit in your qualifying exam, following APSCHE's guidelines.",
                        "Quota & Fees",
                        List.of("What is management quota?", "What is B Category?", "How does management quota work?")),
                new FaqData("How do I apply for B-Category admission?",
                        "You can apply right online at admissions.nrtec.in, or just give us a call at 9154686203, or drop an email to admissions@nrtec.in.",
                        "Admissions",
                        List.of("How to apply management quota?", "Apply for B Category",
                                "Direct admission procedure")),
                new FaqData("What happens to vacant seats after counselling?",
                        "If any seats are still open after the last round of counselling, the college fills them through spot admissions.",
                        "Admissions",
                        List.of("Spot admission", "Are there seats available after counselling?",
                                "Leftover seats after counselling")),
                new FaqData("What entrance exam do I need for B.Tech convener quota?",
                        "You'll need a valid AP EAPCET rank — seats get allotted through APSCHE's online counselling.",
                        "Admissions",
                        List.of("B.Tech entrance exam", "Which exam for BTech admission?",
                                "Do I need EAPCET for BTech?")),
                new FaqData("What entrance exam do I need for M.Tech convener quota?",
                        "You'll need either a GATE or PGECET score, and again, it goes through APSCHE's counselling process.",
                        "Admissions",
                        List.of("M.Tech entrance exam", "Which exam for MTech admission?",
                                "Do I need GATE for MTech?")),
                new FaqData("What entrance exam do I need for MBA or MCA convener quota?",
                        "A valid APICET rank does it — seats are allotted through APSCHE's online counselling.",
                        "Admissions",
                        List.of("MBA entrance exam", "MCA entrance exam", "Which exam for MBA MCA admission?")),
                new FaqData("Can I apply for admission without an entrance exam rank?",
                        "Yep, absolutely — you can apply under the management quota, which is based on your qualifying exam marks, no entrance exam rank needed. Just head to admissions.nrtec.in.",
                        "Admissions",
                        List.of("Admission without entrance exam", "No EAPCET rank admission",
                                "Direct admission without exam")),
                new FaqData("What B.Tech courses are available and how many seats?",
                        "We've got quite a few options — CSE has 720 seats, CSE-AI has 300, CSE-AI and ML has 240, ECE has 360, IT has 120, CSE-Data Science has 120, and Civil, EEE, Mechanical, and CSE-Cyber Security each have 60 seats.",
                        "Courses",
                        List.of("B.Tech courses offered", "List of BTech branches", "How many seats in BTech?")),
                new FaqData("What PG courses are available and how many seats?",
                        "On the PG side, MCA and MBA each have 180 seats, and M.Tech in CSE has 36. There are also M.Tech specializations like Structural Engineering, Thermal Engineering, Machine Design, VLSI, Power and Industrial Drives, and Digital Electronics — those range from about 9 to 24 seats each.",
                        "Courses",
                        List.of("PG courses offered", "Postgraduate courses at NEC", "M.Tech MBA MCA seats")),
                new FaqData("How many seats are under convener quota and management quota for B.Tech?",
                        "For every branch, it's the same split — 70% convener quota, 30% management quota. So for CSE, for example, that's 504 convener seats and 216 management seats.",
                        "Quota & Fees",
                        List.of("Convener vs management seats", "How many convener seats?",
                                "How many management quota seats?")),
                new FaqData("Is there an NRI quota for admissions?",
                        "Yes, we do have an NRI quota for B.Tech, and it's merit-based, following APSCHE guidelines. Give the admissions office a call at 9154686203, or email admissions@nrtec.in, and they'll walk you through the schedule and forms.",
                        "Admissions",
                        List.of("NRI admission", "Can NRI students apply?", "NRI quota seats")),
                new FaqData("What is the fee structure at NEC?",
                        "Fees depend on the course and which quota you're coming in under, so it's best to check with the admissions office directly for the exact number — you can reach them at 9154686203 or admissions@nrtec.in.",
                        "Quota & Fees",
                        List.of("NEC fees", "How much are the fees?", "B.Tech fee", "Tuition fee")),
                new FaqData("What documents are required for admission?",
                        "You'll generally need your marks memo, your entrance exam rank card, transfer and study certificates, category or income certificate if that applies to you, your Aadhar card, and a few passport photos. It's worth double-checking the full list with the admissions office too.",
                        "Admissions",
                        List.of("Documents needed for admission", "What papers do I need?",
                                "Admission document checklist")),
                new FaqData("What is the admission process at NEC?",
                        "If you're going through convener quota, you'll register for counselling — EAPCET, GATE, or APICET, whichever applies — and your seat gets decided by your rank. If you're going the management quota route, you just apply directly on our website, and once your documents are verified and fees are paid, your seat's confirmed.",
                        "Admissions",
                        List.of("How does admission work?", "Steps to get admission", "Admission procedure")),
                new FaqData("When do admissions open at NEC?",
                        "That really depends on when APSCHE releases the counselling schedule each year, plus our own management quota timeline. Best to call the admissions office so they can give you the exact dates for this year.",
                        "Admissions",
                        List.of("Admission dates", "When can I apply?", "Application deadline")),
                new FaqData("Does NEC offer scholarships?",
                        "Yes, we do! There's merit-based, need-based, and government scholarships available — including Jagananna Vidya Deevena, which covers full tuition for students who qualify through EAPCET or ICET and meet the income criteria.",
                        "Quota & Fees",
                        List.of("Scholarships at NEC", "Fee waiver", "Financial aid for students")),
                new FaqData("Does NEC provide hostel facilities?",
                        "We do — hostels for both boys and girls, with Wi-Fi, dining, laundry, and security around the clock.",
                        "Campus & Support",
                        List.of("Hostel at NEC", "Is accommodation available?", "Boys and girls hostel")),
                new FaqData("Is NEC approved by AICTE?",
                        "Yes, we're AICTE-approved, permanently affiliated with JNTUK Kakinada, autonomous, and we've got an A+ from NAAC.",
                        "Campus & Support",
                        List.of("Is NEC accredited?", "NEC affiliation", "Is NEC a recognized college?")),
                new FaqData("Where do I apply for admission to NEC?",
                        "You can apply online at admissions.nrtec.in, or just call us at 9154686203 or 8106306313, or send an email to admissions@nrtec.in.",
                        "Admissions",
                        List.of("How to apply to NEC?", "NEC admission application",
                                "Apply to Narasaraopeta Engineering College")),
                new FaqData("How do I contact the admissions office?",
                        "You can reach us at 9154686203 or 8106306313, by email at admissions@nrtec.in, or through admissions.nrtec.in.",
                        "Campus & Support",
                        List.of("Admissions contact", "Admission phone number", "Admission email")),
                new FaqData("How do I contact support?",
                        "For any other help, just drop an email to admissions@nrtec.in.", "Campus & Support",
                        List.of("Support email", "How can I get help?")));
        for (FaqData data : faqs) {
            FaqEntry entry = FaqEntry.builder()
                    .question(data.question())
                    .answer(data.answer())
                    .category(data.category())
                    .build();

            data.aliases().stream()
                    .map(a -> FaqAlias.builder().faqEntry(entry).aliasText(a).build())
                    .forEach(entry.getAliases()::add);

            faqRepository.save(entry);
        }

        log.info("Seeded {} FAQ entries.", faqs.size());
    }

    private record FaqData(String question, String answer, String category, List<String> aliases) {
    }
}
