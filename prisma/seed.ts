import { PrismaClient } from "@prisma/client";

// Standalone client (not the singleton) so this runs cleanly under tsx.
const prisma = new PrismaClient();

type SeedComment = {
  externalId: string;
  text: string;
  topic: string;
  sentiment: "positive" | "neutral" | "negative";
  publishedAt: Date;
};

// ── Schools ────────────────────────────────────────────────────────────────
const schools = [
  {
    name: "Metropolitan School Cairo",
    slug: "metropolitan-school-cairo",
    location: "القاهرة الجديدة، التجمع الخامس",
    arabicName: "ميتروبوليتان سكول القاهرة",
  },
  {
    name: "New Cairo British International School",
    slug: "ncbis",
    location: "القاهرة الجديدة، التجمع الأول",
    arabicName: "نيو كايرو بريتيش إنترناشونال سكول",
  },
  {
    name: "Cairo American College",
    slug: "cac",
    location: "القاهرة، المعادي",
    arabicName: "كايرو أمريكان كوليدج",
  },
];

// ── Comments (realistic Egyptian Arabic parent voice) ──────────────────────
const metropolitanComments: SeedComment[] = [
  { externalId: "fb_metro_01", text: "ابني هناك من سنتين ومستوى الانجليزي ممتاز جداً", topic: "english", sentiment: "positive", publishedAt: new Date("2026-09-12") },
  { externalId: "fb_metro_02", text: "المدرسين شغلهم محترم وبيهتموا بكل طالب وده اللي خليبني ارتاح", topic: "teachers", sentiment: "positive", publishedAt: new Date("2026-09-02") },
  { externalId: "fb_metro_03", text: "الأنشطة كتير وحلوة وبنتي مبسوطة جداً معاهم", topic: "activities", sentiment: "positive", publishedAt: new Date("2026-08-20") },
  { externalId: "fb_metro_04", text: "المستوى الدراسي كويس بس محتاج متابعة من البيت", topic: "academics", sentiment: "positive", publishedAt: new Date("2026-08-05") },
  { externalId: "fb_metro_05", text: "المصاريف زادت السنة دي بشكل مبالغ فيه ومفيش توضيح", topic: "fees", sentiment: "negative", publishedAt: new Date("2026-07-28") },
  { externalId: "fb_metro_06", text: "الباص بيتأخر كل يوم والأطفال بيوصلوا متعبين", topic: "transport", sentiment: "negative", publishedAt: new Date("2026-07-15") },
  { externalId: "fb_metro_07", text: "التواصل مع الإدارة ضعيف ومحدش بيرد على رسايلك إلا بعد أيام", topic: "communication", sentiment: "negative", publishedAt: new Date("2026-07-03") },
  { externalId: "fb_metro_08", text: "الإدارة مقفولة شوية وقراراتها مش واضحة", topic: "administration", sentiment: "negative", publishedAt: new Date("2026-06-20") },
  { externalId: "fb_metro_09", text: "كثافة الفصول حلوة، كل فصل 20 طالب بالكتير", topic: "class_size", sentiment: "positive", publishedAt: new Date("2026-06-10") },
  { externalId: "fb_metro_10", text: "النظافة ممتازة والمكان دايماً مترتب", topic: "cleanliness", sentiment: "positive", publishedAt: new Date("2026-05-28") },
  { externalId: "fb_metro_11", text: "الواجبات كتير شوية على المرحلة الابتدائية", topic: "homework", sentiment: "negative", publishedAt: new Date("2026-05-15") },
  { externalId: "fb_metro_12", text: "بنتي اتعرفت على أصحاب كويسين والأجواء محترمة", topic: "activities", sentiment: "positive", publishedAt: new Date("2026-05-02") },
  { externalId: "fb_metro_13", text: "الإنجليزي مستواهم فيه أحسن من باقي المواد بفرق", topic: "english", sentiment: "positive", publishedAt: new Date("2026-04-20") },
  { externalId: "fb_metro_14", text: "الضغط الدراسي زيادة عن اللزوم آخر السنة", topic: "academic_pressure", sentiment: "negative", publishedAt: new Date("2026-04-10") },
  { externalId: "fb_metro_15", text: "المدرسين بطيئين شوية في رد الفعل لو الطفل متأخر", topic: "teachers", sentiment: "neutral", publishedAt: new Date("2026-03-28") },
  { externalId: "fb_metro_16", text: "الانضباط في المواعيد كويس بس الاستاذات بيتأخروا أحياناً", topic: "discipline", sentiment: "neutral", publishedAt: new Date("2026-03-15") },
  { externalId: "fb_metro_17", text: "سألت على الباص قالوا هيتحسن الترم الجاي نشوف", topic: "transport", sentiment: "neutral", publishedAt: new Date("2026-03-01") },
  { externalId: "fb_metro_18", text: "الأنشطة الرياضية محتاجة تطوير، مفيش ملاعب كفاية", topic: "activities", sentiment: "negative", publishedAt: new Date("2026-02-20") },
  { externalId: "fb_metro_19", text: "المستوى الدراسي متوسط مقارنة بالسعر اللي بتدفعوه", topic: "academics", sentiment: "neutral", publishedAt: new Date("2026-02-08") },
  { externalId: "fb_metro_20", text: "ما شاء الله المدرسة منظمة والموظفين محترمين", topic: "administration", sentiment: "positive", publishedAt: new Date("2026-01-25") },
];

const ncbisComments: SeedComment[] = [
  { externalId: "fb_ncbis_01", text: "المستوى الأكاديمي عالي جداً والأبناء بيتفوقوا", topic: "academics", sentiment: "positive", publishedAt: new Date("2026-09-15") },
  { externalId: "fb_ncbis_02", text: "المدرسين بريطانيين ومستوى التدريس ممتاز", topic: "teachers", sentiment: "positive", publishedAt: new Date("2026-09-05") },
  { externalId: "fb_ncbis_03", text: "المصاريف عالية جداً، تقدر تقول أغلى مدرسة في التجمع", topic: "fees", sentiment: "negative", publishedAt: new Date("2026-08-22") },
  { externalId: "fb_ncbis_04", text: "التواصل مع الإدارة كويس وبيردوا بسرعة على الإيميلات", topic: "communication", sentiment: "positive", publishedAt: new Date("2026-08-08") },
  { externalId: "fb_ncbis_05", text: "كثافة الفصول صغيرة وهو مميزة كبيرة", topic: "class_size", sentiment: "positive", publishedAt: new Date("2026-07-25") },
  { externalId: "fb_ncbis_06", text: "الباص سعره غالي جداً مقارنة بالمسافة", topic: "transport", sentiment: "negative", publishedAt: new Date("2026-07-12") },
  { externalId: "fb_ncbis_07", text: "الأنشطة متعددة وبنتي اتعرفت على مواهبها هناك", topic: "activities", sentiment: "positive", publishedAt: new Date("2026-06-28") },
  { externalId: "fb_ncbis_08", text: "الإنجليزي طبعاً مستواهم فيه ممتاز لأنه أساس المنهج", topic: "english", sentiment: "positive", publishedAt: new Date("2026-06-15") },
  { externalId: "fb_ncbis_09", text: "الواجبات معقولة ومش بيضغطوا على الأطفال", topic: "homework", sentiment: "positive", publishedAt: new Date("2026-06-01") },
  { externalId: "fb_ncbis_10", text: "في حادث تنمر السنة دي والإدارة اتعاملت معاه بجدية", topic: "bullying", sentiment: "neutral", publishedAt: new Date("2026-05-20") },
  { externalId: "fb_ncbis_11", text: "النظافة ممتازة وكورidor المدرسة دايماً نظيف", topic: "cleanliness", sentiment: "positive", publishedAt: new Date("2026-05-08") },
  { externalId: "fb_ncbis_12", text: "الإدارة منظمة بس بيطلبوا مواعيد كتير للقاءات", topic: "administration", sentiment: "neutral", publishedAt: new Date("2026-04-25") },
  { externalId: "fb_ncbis_13", text: "الضغط الدراسي في IGCE مرتفع، محتاج متابعة بيت مكثفة", topic: "academic_pressure", sentiment: "negative", publishedAt: new Date("2026-04-12") },
  { externalId: "fb_ncbis_14", text: "الانضباط في المواعيد صارم وهو حاجة كويسة", topic: "discipline", sentiment: "positive", publishedAt: new Date("2026-03-30") },
  { externalId: "fb_ncbis_15", text: "المدرسين بيغيروا كل سنتين وده بيزعج الأطفال", topic: "teachers", sentiment: "negative", publishedAt: new Date("2026-03-18") },
  { externalId: "fb_ncbis_16", text: "التواصل مع أولياء الأمور ممتاز عن طريق تطبيق المدرسة", topic: "communication", sentiment: "positive", publishedAt: new Date("2026-03-05") },
  { externalId: "fb_ncbis_17", text: "المصاريف بترتفع كل سنة بنسبة 10% تقريباً", topic: "fees", sentiment: "negative", publishedAt: new Date("2026-02-22") },
  { externalId: "fb_ncbis_18", text: "المستوى الدراسي كويس بس المنهج صعب شوية", topic: "academics", sentiment: "neutral", publishedAt: new Date("2026-02-10") },
  { externalId: "fb_ncbis_19", text: "الأنشطة الفنية محتاجة دعم أكتر", topic: "activities", sentiment: "neutral", publishedAt: new Date("2026-01-28") },
  { externalId: "fb_ncbis_20", text: "الباص نظيف والمشرفين محترمين بس بيتأخر أحياناً", topic: "transport", sentiment: "neutral", publishedAt: new Date("2026-01-15") },
];

const cacComments: SeedComment[] = [
  { externalId: "fb_cac_01", text: "المدرسة عندها سمعة كويسة والمستوى الدراسي عالي", topic: "academics", sentiment: "positive", publishedAt: new Date("2026-09-18") },
  { externalId: "fb_cac_02", text: "المدرسين خبرة وكفاءة وعندهم قدرة على التعامل مع الفروق الفردية", topic: "teachers", sentiment: "positive", publishedAt: new Date("2026-09-08") },
  { externalId: "fb_cac_03", text: "الأنشطة الرياضية ممتازة وعندهم فرق قوية", topic: "activities", sentiment: "positive", publishedAt: new Date("2026-08-25") },
  { externalId: "fb_cac_04", text: "المصاريف مرتفعة بس تستاهل المستوى", topic: "fees", sentiment: "neutral", publishedAt: new Date("2026-08-12") },
  { externalId: "fb_cac_05", text: "الباص بيوصل كل مناطق المعادي بس سعره غالي", topic: "transport", sentiment: "neutral", publishedAt: new Date("2026-07-30") },
  { externalId: "fb_cac_06", text: "كثافة الفصول 22 طالب وهي نسبة كويسة", topic: "class_size", sentiment: "positive", publishedAt: new Date("2026-07-18") },
  { externalId: "fb_cac_07", text: "الإنجليزي مستوى عالي جداً لأنه لغة التدريس الأساسية", topic: "english", sentiment: "positive", publishedAt: new Date("2026-07-05") },
  { externalId: "fb_cac_08", text: "التواصل مع الإدارة كويس بس أحياناً بياخدوا وقت", topic: "communication", sentiment: "neutral", publishedAt: new Date("2026-06-22") },
  { externalId: "fb_cac_09", text: "الإدارة محترمة وبتسمع لأولياء الأمور", topic: "administration", sentiment: "positive", publishedAt: new Date("2026-06-10") },
  { externalId: "fb_cac_10", text: "في شكاوى بخصوص التنمر وبعض الأهالي اشتكوا", topic: "bullying", sentiment: "negative", publishedAt: new Date("2026-05-27") },
  { externalId: "fb_cac_11", text: "النظافة كويسة بس ممكن أحسن في الحمامات", topic: "cleanliness", sentiment: "neutral", publishedAt: new Date("2026-05-14") },
  { externalId: "fb_cac_12", text: "الواجبات معقولة ومش بيضغطوا كتير", topic: "homework", sentiment: "positive", publishedAt: new Date("2026-05-01") },
  { externalId: "fb_cac_13", text: "الانضباط صارم والأطفال بيتعلموا الالتزام", topic: "discipline", sentiment: "positive", publishedAt: new Date("2026-04-18") },
  { externalId: "fb_cac_14", text: "الضغط الدراسي في الثانوية مرتفع جداً", topic: "academic_pressure", sentiment: "negative", publishedAt: new Date("2026-04-05") },
  { externalId: "fb_cac_15", text: "المدرسين بيتغيروا أحياناً وده بيأثر على الاستقرار", topic: "teachers", sentiment: "neutral", publishedAt: new Date("2026-03-23") },
  { externalId: "fb_cac_16", text: "المصاريف زادت آخر سنتين بشكل ملحوظ", topic: "fees", sentiment: "negative", publishedAt: new Date("2026-03-10") },
  { externalId: "fb_cac_17", text: "الأنشطة الفنية والثقافية متنوعة وبنتي مبسوطة", topic: "activities", sentiment: "positive", publishedAt: new Date("2026-02-25") },
  { externalId: "fb_cac_18", text: "التواصل مع المدرسين مباشر عن طريق الإيميل وهو مريح", topic: "communication", sentiment: "positive", publishedAt: new Date("2026-02-12") },
  { externalId: "fb_cac_19", text: "المستوى الدراسي عامة كويس بس الرياضيات محتاجة تقوية", topic: "academics", sentiment: "neutral", publishedAt: new Date("2026-01-30") },
  { externalId: "fb_cac_20", text: "الباص نظيف ومنظم بس مش بيوصل كل المناطق", topic: "transport", sentiment: "neutral", publishedAt: new Date("2026-01-17") },
];

const schoolCommentsMap: Record<string, SeedComment[]> = {
  "metropolitan-school-cairo": metropolitanComments,
  ncbis: ncbisComments,
  cac: cacComments,
};

async function main() {
  console.log("🗑️  Clearing existing data...");
  await prisma.comment.deleteMany();
  await prisma.school.deleteMany();

  let totalComments = 0;
  for (const s of schools) {
    const school = await prisma.school.create({ data: {
      name: s.name, slug: s.slug, location: s.location, arabicName: s.arabicName,
    }});
    const comments = schoolCommentsMap[s.slug] ?? [];
    for (const c of comments) {
      await prisma.comment.create({ data: {
        externalId: c.externalId, source: "facebook", schoolId: school.id,
        text: c.text, topic: c.topic, sentiment: c.sentiment, publishedAt: c.publishedAt,
      }});
    }
    totalComments += comments.length;
    console.log(`🏫  ${s.name}: ${comments.length} comments`);
  }

  console.log(`\n✅ Seeded ${schools.length} schools and ${totalComments} comments.`);
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });