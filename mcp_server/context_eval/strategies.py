from copy import deepcopy
from typing import Dict, List


def sliding_window(
    messages: List[Dict[str, str]],
    window_size: int = 20
) -> List[Dict[str, str]]:

    if window_size <= 0:
        return []

    if len(messages) <= window_size:
        return deepcopy(messages)

    return deepcopy(messages[-window_size:])


def observation_masking(
    messages: List[Dict[str, str]],
    keep_recent_tool_outputs: int = 3
) -> List[Dict[str, str]]:

    pruned_messages = deepcopy(messages)

    tool_indices = [
        index
        for index, message in enumerate(pruned_messages)
        if message.get("role") == "tool"
    ]

    if len(tool_indices) <= keep_recent_tool_outputs:
        return pruned_messages

    for index in tool_indices[:-keep_recent_tool_outputs]:
        pruned_messages[index]["content"] = (
            "[tool output omitted]"
        )

    return pruned_messages


def recursive_summarization(
    messages: List[Dict[str, str]],
    chunk_size: int = 15,
    keep_recent: int = 5
) -> List[Dict[str, str]]:
    pruned = deepcopy(messages)
    if len(pruned) <= keep_recent:
        return pruned

    old_messages = pruned[:-keep_recent]
    recent_messages = pruned[-keep_recent:]

    summarized_chunks = []
    for i in range(0, len(old_messages), chunk_size):
        chunk = old_messages[i:i + chunk_size]
        
        extracted_facts = []
        for msg in chunk:
            content = msg.get("content", "")
            lines = [line.strip() for line in content.split("\n") if line.strip()]
            if lines:
                extracted_facts.append(lines[0])

        summary_text = " | ".join(extracted_facts)
        summarized_chunks.append({
            "role": "system",
            "content": f"[Summary of turns {i + 1} to {i + len(chunk)}: {summary_text}]"
        })

    return summarized_chunks + recent_messages


def zone_based_pruning(
    messages: List[Dict[str, str]],
    keep_initial: int = 2,
    keep_recent: int = 5
) -> List[Dict[str, str]]:
  
    pruned = deepcopy(messages)
    if len(pruned) <= (keep_initial + keep_recent):
        return pruned

    initial_zone = pruned[:keep_initial]
    recent_zone = pruned[-keep_recent:]
    middle_zone = pruned[keep_initial:-keep_recent]

    pruned_middle = []
    for msg in middle_zone:
        msg_copy = deepcopy(msg)
        if msg_copy.get("role") == "tool":
            msg_copy["content"] = "[tool output omitted in middle zone]"
        pruned_middle.append(msg_copy)

    return initial_zone + pruned_middle + recent_zone