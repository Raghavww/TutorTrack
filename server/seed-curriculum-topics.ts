import { db } from "./db";
import { curriculumTopics } from "@shared/schema";

const mathsTopics = [
  {
    name: "Operations",
    subtopics: ["Addition", "Subtraction", "Multiplication", "Division"],
  },
  {
    name: "Worded Operations",
    subtopics: [],
  },
  {
    name: "Indices and Root Numbers",
    subtopics: ["Indices", "Root Numbers"],
  },
  {
    name: "Factors",
    subtopics: [],
  },
  {
    name: "Prime Numbers",
    subtopics: [],
  },
  {
    name: "Multiples",
    subtopics: [],
  },
  {
    name: "Inverse Operation",
    subtopics: [],
  },
  {
    name: "Decimals and Rounding",
    subtopics: [
      "Place Value",
      "Size Order",
      "Addition",
      "Subtraction",
      "Multiplying/Dividing by 10, 100, 1000 etc.",
      "Multiplying",
      "Rounding Whole Numbers",
      "Rounding Decimal Numbers",
      "Dividing",
    ],
  },
  {
    name: "BIDMAS",
    subtopics: [],
  },
  {
    name: "Estimating",
    subtopics: [],
  },
  {
    name: "Sequences",
    subtopics: [],
  },
  {
    name: "Roman Numerals",
    subtopics: [],
  },
  {
    name: "Fractions",
    subtopics: [
      "Types of Fractions & Converting",
      "Simplifying Fractions",
      "Common Denominators",
      "Adding Fractions",
      "Subtracting Fractions",
      "Multiplying Fractions",
      "Dividing Fractions",
      "Operations Between Fractions and Whole Numbers",
      "Size Order",
      "Converting Fractions into Decimals",
      "Converting Decimals into Fractions",
      "Fractions and Decimals in Size Order",
      "Rules of Fractions: Of and Is",
      "Fraction Word Problems",
    ],
  },
  {
    name: "Number Lines",
    subtopics: [],
  },
  {
    name: "Units of Measurement",
    subtopics: ["Converting Units", "Estimating Measurements"],
  },
  {
    name: "Direct Proportion and Money",
    subtopics: [],
  },
  {
    name: "Averages",
    subtopics: ["Calculating Averages", "Finding the Total from the Mean"],
  },
  {
    name: "Percentages",
    subtopics: [
      "Finding a Percentage of a Number",
      "Increasing or Decreasing a Number by a Percentage",
      "Finding 100% from Another Percent",
      "Word Problems",
      "Percentage Change",
      "Converting Fractions, Percentages and Decimals",
      "Ordering Fractions, Percentages and Decimals",
    ],
  },
  {
    name: "Ratios, Shares & Proportion",
    subtopics: [
      "Understanding Ratios",
      "Changing an Amount According to a Ratio",
      "Sharing Between a Ratio & Worded Problems",
      "Inverse Proportion",
      "Uneven Shares",
      "Scales",
      "Relationships Between Equations",
    ],
  },
  {
    name: "Shapes & Symmetry",
    subtopics: [
      "Symmetry and Rotational Symmetry",
      "2D Shapes",
      "3D Shapes",
    ],
  },
  {
    name: "Angles",
    subtopics: [
      "Understanding and Applying the Rules",
      "Parallel Line Rules",
      "Internal and External Angles",
      "Using a Compass",
      "Bearings",
    ],
  },
  {
    name: "Perimeter, Area and Volume",
    subtopics: [
      "Finding Perimeter and Area",
      "Compound Shapes, Remaining Area and Word Problems",
      "Volume",
      "Applying Area and Volume",
      "Converting Squared/Cubed Units",
      "Using Circles",
    ],
  },
  {
    name: "Time",
    subtopics: [
      "Working with Dates",
      "Working with Units of Time",
      "Time and Degrees",
      "Time Problems",
      "Timetables",
    ],
  },
  {
    name: "Speed, Distance and Time",
    subtopics: [
      "Word Problems",
      "Distance-Time Graphs",
    ],
  },
  {
    name: "Probability",
    subtopics: [
      "An Introduction to Probability",
      "Diagrams and Rules in Probability",
      "Probability Tree Diagrams",
      "Applied Problems",
    ],
  },
  {
    name: "Interpreting Data",
    subtopics: [
      "Frequency, Distance and Other Tables",
      "Bar Charts",
      "Pie Charts",
      "Line and Conversion Graphs",
      "Venn Diagrams, Pictograms, Flow Charts and Stem & Leaf Diagrams",
    ],
  },
  {
    name: "Coordinates and Geometry",
    subtopics: [
      "Understanding and Applying Coordinates",
      "Transformations: Translation",
      "Transformations: Reflection",
      "Transformations: Rotation",
      "Transformations: Enlargement",
      "Shapes, Networks and Directions",
    ],
  },
  {
    name: "Algebra",
    subtopics: [
      "Using Positive and Negative Numbers",
      "Simplifying",
      "Expanding Brackets",
      "Solving Equations",
      "Solving Equations with Variables on Both Sides",
      "Substitution",
      "Nth Term",
      "Applied Problems",
      "Simultaneous Equations",
    ],
  },
];

async function seedCurriculumTopics() {
  console.log("Seeding curriculum topics...");

  // Get existing topics to avoid duplicates
  const existing = await db.select().from(curriculumTopics);
  const existingNames = new Set(existing.filter(t => t.parentId === null).map(t => t.name));
  
  // Find the max sort order to continue from
  let sortOrder = existing.length > 0 
    ? Math.max(...existing.filter(t => t.parentId === null).map(t => t.sortOrder ?? 0)) + 1 
    : 0;

  let addedCount = 0;

  for (const topic of mathsTopics) {
    // Skip if topic already exists
    if (existingNames.has(topic.name)) {
      console.log(`Topic already exists: ${topic.name}`);
      continue;
    }

    // Insert main topic
    const [mainTopic] = await db
      .insert(curriculumTopics)
      .values({
        name: topic.name,
        parentId: null,
        subject: "Maths",
        sortOrder: sortOrder++,
        isActive: true,
      })
      .returning();

    console.log(`Created topic: ${topic.name}`);
    addedCount++;

    // Insert subtopics
    let subSortOrder = 0;
    for (const subtopicName of topic.subtopics) {
      await db.insert(curriculumTopics).values({
        name: subtopicName,
        parentId: mainTopic.id,
        subject: "Maths",
        sortOrder: subSortOrder++,
        isActive: true,
      });
      console.log(`  - Created subtopic: ${subtopicName}`);
      addedCount++;
    }
  }

  console.log(`Curriculum topics seeded successfully! Added ${addedCount} new topics.`);
}

seedCurriculumTopics()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error seeding curriculum topics:", error);
    process.exit(1);
  });
