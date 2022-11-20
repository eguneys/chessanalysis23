import { Pos, Fen, UCI, Node, uci_char, MobileSituation, TreeBuilder } from 'lchessanalysis'

export type Match = Array<Array<Pos>>

export class Puzzle {
  static make = (fen: Fen, moves: Array<UCI>) => {

  let situation = MobileSituation.from_fen(fen)

  let [first, ...rest] = moves

  let root = TreeBuilder.apply(situation, moves)



  let node = root.node_at_path_or_undefined(uci_char(first))

  if (!node) {
    return undefined
  }

  node = node.map_comments(_ => `__solution__`)


  root = TreeBuilder.apply(situation, [])
  root.add_node(node, '')

  return new Puzzle(root, node)
  }

  constructor(readonly root: Node, readonly node: Node) {}
}



export class AnalysePuzzle {
 
  static make = (
    gen: (_: MobileSituation) => Match, 
    gen_map: Array<string>, 
    pos_map: Map<Pos, string>,
    idea_nodes: Node,
    puzzle: Puzzle) => {


      let matches = gen(MobileSituation.from_fen(puzzle.node.fen))

      if (matches.length > 0) {

        idea_nodes = idea_nodes.map_comments(_ => {
          return `__bot__`
        })

        let res = matches.map(_match0 => {

          let convert_map = new Map<Pos, Pos>([...pos_map.entries()].map(([o, v]) => {
            return [o, _match0[gen_map.indexOf(v)]]
          }))


          return TreeBuilder.uci_convert(puzzle.root,
                                         puzzle.root.children[0].id,
                                         idea_nodes, convert_map)

        })

        return res.find(_ => !!_)
      }
      return undefined
  }
}
