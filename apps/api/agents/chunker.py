"""Multilingual chunker respecting Arabic and English sentence boundaries.

Target: 500–800 tokens per chunk. Uses heading and paragraph boundaries first,
then sentence-level splitting when a paragraph exceeds the target.
"""

import re

# Approx tokens per character for mixed Arabic/English text.
_CHARS_PER_TOKEN = 3.5
_TARGET_MIN = 500
_TARGET_MAX = 800
_TARGET_CHARS_MIN = int(_TARGET_MIN * _CHARS_PER_TOKEN)
_TARGET_CHARS_MAX = int(_TARGET_MAX * _CHARS_PER_TOKEN)

# Arabic sentence-ending punctuation.
_ARABIC_SENTENCE_END = re.compile(r"[.!?؟।۔\n]+")
# Heading pattern: lines in ALL CAPS or starting with a number/bullet.
_HEADING = re.compile(r"^(?:[A-Z][A-Z\s]{3,}|(?:\d+[\.\)]\s)|(?:[-•]\s))", re.MULTILINE)


def chunk_text(text: str) -> list[str]:
    """Split text into chunks of ~500-800 tokens."""
    paragraphs = _split_paragraphs(text)
    chunks: list[str] = []
    buffer = ""

    for para in paragraphs:
        if not para.strip():
            continue

        candidate = (buffer + "\n\n" + para).strip() if buffer else para.strip()

        if len(candidate) <= _TARGET_CHARS_MAX:
            buffer = candidate
        else:
            if buffer:
                chunks.append(buffer)
                buffer = ""
            # Para itself may exceed max — split at sentence boundaries.
            if len(para) > _TARGET_CHARS_MAX:
                for sentence_chunk in _split_by_sentences(para):
                    chunks.append(sentence_chunk)
            else:
                buffer = para.strip()

    if buffer:
        chunks.append(buffer)

    return [c for c in chunks if len(c.strip()) > 20]


def _split_paragraphs(text: str) -> list[str]:
    """Split on blank lines or heading patterns."""
    parts = re.split(r"\n{2,}", text)
    result: list[str] = []
    for part in parts:
        lines = part.split("\n")
        current: list[str] = []
        for line in lines:
            if _HEADING.match(line) and current:
                result.append("\n".join(current))
                current = [line]
            else:
                current.append(line)
        if current:
            result.append("\n".join(current))
    return result


def _split_by_sentences(text: str) -> list[str]:
    """Split a long paragraph at sentence boundaries."""
    sentences = _ARABIC_SENTENCE_END.split(text)
    chunks: list[str] = []
    buffer = ""

    for sentence in sentences:
        sentence = sentence.strip()
        if not sentence:
            continue
        candidate = (buffer + " " + sentence).strip() if buffer else sentence
        if len(candidate) >= _TARGET_CHARS_MIN:
            chunks.append(candidate)
            buffer = ""
        else:
            buffer = candidate

    if buffer:
        chunks.append(buffer)

    return chunks or [text]
