# XSD Mapper

Welcome to XSD Mapper, a web-based visual tool designed to simplify the process of mapping data between two different XSD (XML Schema Definition) structures. This application provides an intuitive drag-and-drop interface to create connections, define transformations, and generate the corresponding XSLT (Extensible Stylesheet Language Transformations) file.

## ✨ Features

- **Visual Schema Mapping**: Load your source and target XSD schemas and see them displayed in a clear, hierarchical tree view.
- **Drag-and-Drop Interface**: Create mappings between schema elements by simply dragging a node from the source panel and dropping it onto a node in the target panel.
- **Connection Visualizations**: Lines are dynamically drawn between mapped fields, giving you a clear overview of all the connections.
- **Transformation Logic**: Apply transformations to your mappings, such as converting text to uppercase or concatenating fields.
- **Live XML Preview**: Instantly preview a sample of the transformed XML output based on your current mappings and transformations.
- **XSLT Generation**: Automatically generate and download a valid XSLT file that represents your defined mappings, ready for use in any XML transformation workflow.
- **Interactive UI**: A modern and responsive interface built with interactive elements to make the mapping process smooth and efficient.

## 🚀 Tech Stack

This project is built with a modern, component-based architecture using the following technologies:

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Library**: [React](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/guide/packages/lucide-react)
- **Animation**: [Framer Motion](https://www.framer.com/motion/)

## 🏁 Getting Started

The application is ready to run out of the box. Follow these steps to get started:

1.  **Install Dependencies**: If you have pulled the code locally, run the following command in your terminal to install the required packages:

    ```bash
    npm install
    ```

2.  **Run the Development Server**: Once the dependencies are installed, start the Next.js development server:

    ```bash
    npm run dev
    ```

3.  **Open the App**: Open your web browser and navigate to [http://localhost:9002](http://localhost:9002) to start using the XSD Mapper.

## 🎨 How to Use

1.  **Load Schemas**: Use the "Upload XSD" buttons in the "Source Schema" and "Target Schema" panels to load your respective schemas. (Note: Currently, this loads mock data for demonstration purposes).
2.  **Create Mappings**: Click and drag a field from the source schema panel on the left to a corresponding field in the target schema panel on the right. A line will appear, connecting the two.
3.  **Manage Mappings**:
    - Hover over the dot in the middle of a connecting line to bring up controls.
    - Click the **Wand** icon to open the transformation dialog.
    - Click the **X** icon to delete the mapping.
4.  **Set Transformations**: In the transformation dialog, you can select a transformation type (e.g., `UPPERCASE`) and configure its parameters.
5.  **Preview & Download**:
    - Click the **"Preview XML"** button in the header to see a sample of the final XML output.
    - Click the **"Download XSLT"** button to download the generated transformation file.
