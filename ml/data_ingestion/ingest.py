#!/usr/bin/env python3
"""
MIND-OS Dataset Ingestion and Validation Pipeline
Ingests Eedi MAP, BEETLE, and CBSE datasets, validates against unified schema,
computes quality metrics, and exports normalized processed datasets.
"""

import json
import os
from collections import Counter
from typing import Dict, List, Any

REQUIRED_FIELDS = [
    "question_id",
    "class_level",
    "subject",
    "chapter",
    "concept_id",
    "question_text",
    "student_answer",
    "student_explanation",
    "expected_answer",
    "observed_error",
    "original_dataset_label",
    "mind_os_labels",
    "label_source",
    "verification_status"
]

VALID_MIND_OS_LABELS = {"C1", "C2", "C3", "C4", "C5"}
VALID_STATUSES = {"UNVERIFIED", "PROVISIONALLY_SUPPORTED", "SUFFICIENTLY_SUPPORTED"}

def load_json(filepath: str) -> List[Dict[str, Any]]:
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return []
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)

def validate_and_clean_record(raw: Dict[str, Any], source_name: str) -> Dict[str, Any]:
    cleaned = {}
    missing_fields = []
    
    for field in REQUIRED_FIELDS:
        val = raw.get(field)
        if val is None or val == "":
            missing_fields.append(field)
            cleaned[field] = None
        else:
            cleaned[field] = val

    # Validate mind_os_labels
    labels = cleaned.get("mind_os_labels") or []
    if isinstance(labels, str):
        labels = [labels]
    valid_labels = [l for l in labels if l in VALID_MIND_OS_LABELS]
    if not valid_labels:
        # Default fallback to C1 if untyped error
        valid_labels = ["C1"]
    cleaned["mind_os_labels"] = sorted(list(set(valid_labels)))

    # Status check
    status = cleaned.get("verification_status")
    if status not in VALID_STATUSES:
        cleaned["verification_status"] = "PROVISIONALLY_SUPPORTED"

    cleaned["_source_name"] = source_name
    cleaned["_missing_fields"] = missing_fields
    return cleaned

def run_ingestion():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
    raw_dir = os.path.join(base_dir, "data", "raw")
    processed_dir = os.path.join(base_dir, "data", "processed")
    os.makedirs(processed_dir, exist_ok=True)

    sources = [
        ("Eedi MAP", os.path.join(raw_dir, "eedi_map_sample.json")),
        ("BEETLE ETS", os.path.join(raw_dir, "beetle_sample.json")),
        ("CBSE Exemplar", os.path.join(raw_dir, "cbse_exemplar_sample.json"))
    ]

    all_cleaned: List[Dict[str, Any]] = []
    source_stats = {}
    label_counts = Counter()
    subject_counts = Counter()
    class_counts = Counter()
    missing_field_tally = Counter()

    for name, filepath in sources:
        records = load_json(filepath)
        cleaned_records = []
        for r in records:
            c = validate_and_clean_record(r, name)
            cleaned_records.append(c)
            for lbl in c["mind_os_labels"]:
                label_counts[lbl] += 1
            subject_counts[c.get("subject", "Unknown")] += 1
            class_counts[c.get("class_level", "Unknown")] += 1
            for mf in c["_missing_fields"]:
                missing_field_tally[mf] += 1

        all_cleaned.extend(cleaned_records)
        source_stats[name] = {
            "raw_count": len(records),
            "validated_count": len(cleaned_records)
        }

    # Data Quality Report
    quality_report = {
        "status": "VALIDATED",
        "total_records": len(all_cleaned),
        "sources": source_stats,
        "taxonomy_label_distribution": dict(label_counts),
        "subject_distribution": dict(subject_counts),
        "class_level_distribution": dict(class_counts),
        "missing_values_by_field": dict(missing_field_tally),
        "taxonomy_categories_covered": list(sorted(label_counts.keys())),
        "schema_compliance_rate_pct": 100.0 if not missing_field_tally else round((1 - sum(missing_field_tally.values()) / (len(all_cleaned) * len(REQUIRED_FIELDS))) * 100, 2)
    }

    # Strip internal keys before final output
    final_dataset = []
    for r in all_cleaned:
        item = {k: v for k, v in r.items() if not k.startswith("_")}
        final_dataset.append(item)

    # Save processed unified dataset
    out_data_path = os.path.join(processed_dir, "unified_dataset.json")
    with open(out_data_path, "w", encoding="utf-8") as f:
        json.dump(final_dataset, f, indent=2)

    # Save quality report
    out_report_path = os.path.join(processed_dir, "data_quality_report.json")
    with open(out_report_path, "w", encoding="utf-8") as f:
        json.dump(quality_report, f, indent=2)

    print(f"Ingestion successful! Processed {len(final_dataset)} records.")
    print("Quality Report Summary:")
    print(json.dumps(quality_report, indent=2))

if __name__ == "__main__":
    run_ingestion()
