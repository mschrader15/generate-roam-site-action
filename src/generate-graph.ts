import fs from "fs";
import { parse } from 'node-html-parser';
import path from "path";
import glob from 'glob';

type Node = {
    id: string,
    label: string,
    x: number,
    y: number,
    size: number,
};

type Edge = {
    id: string,
    source: Node['id'],
    destination: Node['id']
}

type NodeContainer = Array<{name: string, data: Node}>;

type EdgeContainer = Array<Edge>;

const nameHandler = (name: string): string => name.replace('/', '').replace('.html', '')

const parseHTML = (page: string): Array<string> => {
    const links: string[] = []  
    parse(page).querySelector('section').querySelectorAll("a").map((elem) => {if (elem.attributes['href']){
        if (!elem.attributes['href'].includes('http') && elem.attributes['href'].includes('.html')){
            links.push(nameHandler(elem.attributes['href']))
        }
    }})
    return links
}

const readFiles = (filePath: string): Promise<{name: string, content: string}[]> => {
    return new Promise((resolve, reject) => {
        glob(filePath + '/**/*.html', (error, files) => {
         if (error) {
          reject(error);
          return;
         }
         resolve(files.map(fpath => ({name: nameHandler(fpath.split('out')[1]), content: fs.readFileSync(fpath, 'utf-8')})));
        });
    });
}


export const createGraphData = async (): Promise<void> => {
    const filePath = path.join(process.cwd(), "out");
    const htmlArray = await readFiles(filePath)
    const nodeContainer:NodeContainer = []
    const edgeContainer:EdgeContainer = []
    htmlArray.map((page, index) => {
        nodeContainer.push({
            name: page.name,
            data: {
            id: 'n'+ index.toString(),
            label: nameHandler(decodeURI(page.name)),
            x: 0,
            y: 0,
            size: 1,
            }
        })
    })
    htmlArray.map((page, index) => {
        parseHTML(page.content).map((link, innerIndex) => {
            const match = nodeContainer.find((node) => node.name === link)
            const current = nodeContainer.find((node) => node.name === page.name)
            if (match && current && (match !== current)){
                edgeContainer.push({
                    id: 'e' + index.toString() + innerIndex.toString(),
                    source: current.data.id,
                    destination: match.data.id
                })
                match.data.size += 1
            }
        })
    })
    fs.writeFile("test.json", JSON.stringify({nodes: nodeContainer.map((node) => node.data), edges: edgeContainer}), function(err) {
        if (err) {
            console.log(err);
        }
    });
}

export default createGraphData
