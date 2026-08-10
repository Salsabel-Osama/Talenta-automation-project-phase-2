from pathlib import Path

from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document


class DocumentChunker:

    DOC_TYPES = {
        "policy": "policy",
        "workflow": "workflow",
        "interview": "interview",
        "playbook": "playbook",
        "security": "security",
        "evaluation": "evaluation",
    }

    def __init__(
        self,
        chunk_size: int = 500,
        chunk_overlap: int = 100,
    ):

        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            length_function=len,
            separators=[
                "\n## ",
                "\n# ",
                "\n\n",
                "\n",
                " ",
                "",
            ],
        )

    # ======================================
    # Read Document
    # ======================================

    def load_document(self, path: Path) -> str:

        with open(path, "r", encoding="utf-8") as file:
            return file.read()

    # ======================================
    # Detect Document Type
    # ======================================

    def detect_doc_type(self, filename: str) -> str:

        filename = filename.lower()

        for key, value in self.DOC_TYPES.items():

            if key in filename:
                return value

        return "general"

    # ======================================
    # Chunk One Document
    # ======================================

    def chunk_document(self, path):

        path = Path(path)

        text = self.load_document(path)

        metadata = {
            "source": path.name,
            "doc_type": self.detect_doc_type(path.name),
            "version": "1.0",
        }

        document = Document(
            page_content=text,
            metadata=metadata,
        )

        chunks = self.splitter.split_documents([document])

        for index, chunk in enumerate(chunks):

            chunk.metadata["chunk_id"] = f"{path.stem}_{index}"
            chunk.metadata["chunk_index"] = index
            chunk.metadata["total_chunks"] = len(chunks)

        return chunks

    # ======================================
    # Chunk All Documents
    # ======================================

    def chunk_folder(self, folder=None):

        if folder is None:
            folder = (
                Path(__file__).resolve().parent
                / "documents"
            )
        else:
            folder = Path(folder).resolve()

        print(
            f"Loading documents from: {folder}"
        )

        if not folder.exists():
            print(
                f"ERROR: Documents folder not found: {folder}"
            )
            return []

        files = sorted(
            folder.glob("*.md")
        )

        print(
            f"Found {len(files)} markdown documents."
        )

        all_chunks = []

        for file in files:

            print(
                f"Processing: {file.name}"
            )

            all_chunks.extend(
                self.chunk_document(file)
            )

        print(
            f"Created {len(all_chunks)} chunks."
        )

        return all_chunks
    
# ======================================
# Test
# ======================================

if __name__ == "__main__":

    chunker = DocumentChunker()

    chunks = chunker.chunk_folder()

    print("=" * 60)
    print(f"Total Chunks: {len(chunks)}")
    print("=" * 60)

    if chunks:

        print("Metadata:")
        print(chunks[0].metadata)

        print("\nContent:\n")
        print(chunks[0].page_content)

    else:

        print("No markdown documents found.")