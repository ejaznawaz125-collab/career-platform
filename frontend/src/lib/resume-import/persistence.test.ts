import assert from "node:assert/strict";
import test from "node:test";

import { emptyResumeImportData } from "./contract";
import { prepareResumeImportCollections } from "./persistence";

const emptyExisting = () => ({ experiences: [], educations: [], skills: [], languages: [], portfolioProjects: [] });

test("a ten-item multi-section confirmation prepares only selected records in batches", () => {
  const data = emptyResumeImportData();
  data.personal.firstName = "Aisha";
  data.professional.headline = "Operations specialist";
  data.experience = [
    { company: "Warehouse One", position: "Associate", employmentType: "FULL_TIME", industry: null, location: null, country: null, startDate: "2020-01-01", endDate: "2021-01-01", currentlyWorking: false, description: null, achievements: [] },
    { company: "Warehouse Two", position: "Coordinator", employmentType: "FULL_TIME", industry: null, location: null, country: null, startDate: "2021-02-01", endDate: null, currentlyWorking: true, description: null, achievements: [] },
    { company: "Unselected", position: "Unselected", employmentType: null, industry: null, location: null, country: null, startDate: "2019-01-01", endDate: null, currentlyWorking: false, description: null, achievements: [] },
  ];
  data.education = [
    { institute: "College One", degree: "Diploma One", fieldOfStudy: null, educationLevel: "DIPLOMA", country: null, city: null, startYear: 2017, endYear: 2018, currentlyStudying: false, grade: null, description: null },
    { institute: "College Two", degree: "Diploma Two", fieldOfStudy: null, educationLevel: "DIPLOMA", country: null, city: null, startYear: 2018, endYear: 2019, currentlyStudying: false, grade: null, description: null },
  ];
  data.skills = [{ name: "Picking", category: null, years: 2 }, { name: "Packing", category: null, years: 2 }, { name: "Unselected", category: null, years: null }];
  data.languages = [{ language: "English", proficiency: "FLUENT", isNative: false }, { language: "Urdu", proficiency: "NATIVE", isNative: true }];

  const collections = prepareResumeImportCollections("profile-1", emptyExisting(), data, { experience: [0, 1], education: [0, 1], skills: [0, 1], languages: [0, 1], projects: [] });
  assert.deepEqual({ profileScalars: 2, experience: collections.experience.length, education: collections.education.length, skills: collections.skills.length, languages: collections.languages.length }, { profileScalars: 2, experience: 2, education: 2, skills: 2, languages: 2 });
  assert.equal(collections.experience.some((item) => item.company === "Unselected"), false);
  assert.equal(collections.skills.some((item) => item.name === "Unselected"), false);
  assert.equal(collections.duplicates, 0);
});

test("existing conflicts and duplicates within one confirmation are not inserted twice", () => {
  const data = emptyResumeImportData();
  const experience = { company: "Example Co", position: "Associate", employmentType: null, industry: null, location: null, country: null, startDate: "2020-01-01", endDate: null, currentlyWorking: false, description: null, achievements: [] };
  data.experience = [experience, { ...experience }];
  data.skills = [{ name: "Existing Skill", category: null, years: null }, { name: "New Skill", category: null, years: null }, { name: "new skill", category: null, years: 1 }];
  const existing = { ...emptyExisting(), skills: [{ id: "skill-1", profileId: "profile-1", name: "existing skill", category: null, level: 1, years: null, featured: false, createdAt: new Date(0), updatedAt: new Date(0) }] };

  const collections = prepareResumeImportCollections("profile-1", existing, data, { experience: [0, 1], education: [], skills: [0, 1, 2], languages: [], projects: [] });
  assert.equal(collections.experience.length, 1);
  assert.deepEqual(collections.skills.map((item) => item.name), ["New Skill"]);
  assert.equal(collections.duplicates, 3);
});
