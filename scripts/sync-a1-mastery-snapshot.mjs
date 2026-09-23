import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const previousPath = resolve(process.cwd(), "drizzle/meta/0004_snapshot.json");
const nextPath = resolve(process.cwd(), "drizzle/meta/0005_snapshot.json");
const snapshot = JSON.parse(await readFile(previousPath, "utf8"));
const previousId = snapshot.id;
snapshot.prevId = previousId;
snapshot.id = "ae5fd57d-47ee-4fb1-b627-82d68eef5c91";

const column = (name, type, primaryKey = false) => ({ name, type, primaryKey, notNull: true, autoincrement: false });
snapshot.tables.level_assessment_results = {
  name: "level_assessment_results",
  columns: {
    attempt_id: column("attempt_id", "text", true),
    user_id: column("user_id", "text"),
    language_code: column("language_code", "text"),
    level_code: column("level_code", "text"),
    overall_percent: column("overall_percent", "integer"),
    skills: column("skills", "text"),
    weak_skills: column("weak_skills", "text"),
    recommended_lessons: column("recommended_lessons", "text"),
    passed: column("passed", "integer"),
    completed_at: column("completed_at", "text"),
  },
  indexes: {
    idx_level_assessment_results_user_level: {
      name: "idx_level_assessment_results_user_level",
      columns: ["user_id", "level_code", "completed_at"],
      isUnique: false,
    },
  },
  foreignKeys: {
    level_assessment_results_attempt_id_challenge_attempts_id_fk: {
      name: "level_assessment_results_attempt_id_challenge_attempts_id_fk",
      tableFrom: "level_assessment_results",
      tableTo: "challenge_attempts",
      columnsFrom: ["attempt_id"],
      columnsTo: ["id"],
      onDelete: "cascade",
      onUpdate: "no action",
    },
    level_assessment_results_user_id_users_id_fk: {
      name: "level_assessment_results_user_id_users_id_fk",
      tableFrom: "level_assessment_results",
      tableTo: "users",
      columnsFrom: ["user_id"],
      columnsTo: ["id"],
      onDelete: "cascade",
      onUpdate: "no action",
    },
  },
  compositePrimaryKeys: {},
  uniqueConstraints: {},
  checkConstraints: {},
};

await writeFile(nextPath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
console.log("Wrote drizzle/meta/0005_snapshot.json");
