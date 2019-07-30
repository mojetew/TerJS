import java.io.*;

public class TxtRead extends FileParser {

    public TxtRead(File in, OutputStream out) throws FileNotFoundException {
        super(in, out);
    }

    @Override
    public void run() {
        try {
            out.write("$={".getBytes());

            String className = null;
            String[] split;
            Boolean isArray = null;
            boolean requireComma = false,
                    choiceReqComm = false,
                    didPointer = false;
            StringBuilder
                    builder = new StringBuilder(),
                    classBuilder = new StringBuilder(),
                    choiceArrayBuilder = new StringBuilder(),
                    choiceBuilder = new StringBuilder();
            int i, pointerArray = 0;

            //special cases
            if (file.getName().equals("stats.txt")) {
                //environments need to know if images exist
                if (file.getParentFile().getParentFile().getName().equals("environments")) {
                    for (String fl : file.getParentFile().list()) {
                        if (fl.startsWith("env_")) {
                            out.write((fl.substring(4, fl.indexOf('.')) + ":1,").getBytes());
                        }
                    }
                //characters need to know if character.png exists
                } else if (file.getParentFile().getParentFile().getName().equals("characters")) {
                    for (String str : file.getParentFile().list())
                        if (str.equals("character.png"))
                            out.write("charPng:1,".getBytes());

                }
            }

            do {
                if ((i = in.read()) == '\n' || i == -1) {
                    String sentence = builder.toString().trim();
                    builder.setLength(0);
                    if (sentence.length() > 0 && !sentence.startsWith(">>")) {
                        if (sentence.startsWith("||")) {
                            //new dialog
                            if (didPointer || choiceBuilder.length() > 0) {
                                //only add to official choice array if anything points to them
                                if (choiceArrayBuilder.length() > 0) choiceArrayBuilder.append(',');
                                choiceArrayBuilder.append('[').append(choiceBuilder).append("]");
                                choiceBuilder.setLength(0);
                                pointerArray++;
                                didPointer = false;
                                choiceReqComm = false;
                            }
                        } else if (sentence.charAt(0) == '{') {
                            //new pointer
                            if (requireComma) out.write(',');
                            else requireComma = true;
                            didPointer = true;
                            //pointer logic
                            int state = 0;
                            StringBuilder string = new StringBuilder();
                            for (char chr : sentence.toCharArray()) {
                                switch (chr) {
                                    case '{':
                                        break;
                                    case '|':
                                        assert state == 0;
                                        out.write(('p' + string.toString().replaceAll("[' ]", "_")
                                                + ":{funcs:[").getBytes());
                                        string.setLength(0);
                                        state = 1;
                                        break;
                                    case '}':
                                        switch (state) {
                                            case 0:
                                                out.write(('p' + string.toString().trim()
                                                        .replaceAll("[' ]", "_") + ":{funcs:[]").getBytes());
                                                break;
                                            case 1:
                                                out.write(("[\"" + string.toString() + "\",[]]]").getBytes());
                                                break;
                                            case 4:
                                                out.write(',');
                                            case 3:
                                                if (isNumber(string.toString()))
                                                    out.write((string.toString().trim()).getBytes());
                                                else out.write(('"' + string.append('"').toString().trim()).getBytes());
                                                out.write("]]]".getBytes());
                                                break;
                                            case 2:
                                                out.write(",[".getBytes());
                                                if (isNumber(string.toString()))
                                                    out.write((string.toString().trim()).getBytes());
                                                else out.write(('"' + string.append('"').toString().trim()).getBytes());
                                                out.write(",[]]]".getBytes());
                                        }
                                        out.write(',');
                                        string.setLength(0);
                                        state = 5;
                                        break;
                                    case ' ':
                                    case ',':
                                        if (string.length() > 0) {
                                            switch (state) {
                                                case 4:
                                                    out.write(',');
                                                case 3:
                                                    if (isNumber(string.toString()))
                                                        out.write(string.toString().getBytes());
                                                    else out.write(('"' + string.append('"').toString()).getBytes());
                                                    string.setLength(0);
                                                    if (chr == ',') {
                                                        out.write("]]".getBytes());
                                                        state = 2;
                                                    } else state = 4;
                                                    break;
                                                case 2:
                                                    out.write(',');
                                                case 1:
                                                    out.write(("[\"" + string.toString() + "\",[").getBytes());
                                                    string.setLength(0);
                                                    if (chr == ',') {
                                                        out.write("]]".getBytes());
                                                        state = 2;
                                                    } else state = 3;
                                                    break;
                                                case 5:
                                                    string.append(chr);
                                            }
                                        }
                                        break;
                                    default:
                                        string.append(chr);
                                }
                            }
                            out.write(("p:" + pointerArray + ",text:\"" + string.toString()
                                    .replace("\"", "\\\"") + "\"}").getBytes());
                        } else if (sentence.charAt(0) == '[') {
                            //new choice
                            if (choiceReqComm) choiceBuilder.append(',');
                            choiceReqComm = true;
                            choiceBuilder.append('{');
                            //choice logic
                            int state = 0;
                            StringBuilder string = new StringBuilder();
                            for (char chr : sentence.toCharArray()) {
                                switch (chr) {
                                    case '[':
                                        break;
                                    case '|':
                                        assert state == 0;
                                        choiceBuilder.append("to:\"")
                                                .append(string.toString().replaceAll("[' ]", "_"))
                                                .append("\",funcs:[");
                                        string.setLength(0);
                                        state = 1;
                                        break;
                                    case ']':
                                        switch (state) {
                                            case 0:
                                                choiceBuilder.append("to:\"").append(string.toString().trim()
                                                        .replaceAll("[' ]", "_")).append("\",funcs:[]");
                                                break;
                                            case 1:
                                                choiceBuilder.append("[\"").append(string.toString()).append("\",[]]]");
                                                break;
                                            case 2:
                                                choiceBuilder.append(']');
                                                break;
                                            case 4:
                                                choiceBuilder.append(',');
                                            case 3:
                                                if (isNumber(string.toString()))
                                                    choiceBuilder.append(string.toString().trim());
                                                else
                                                    choiceBuilder.append('"').append(string.append('"').toString().trim());
                                                choiceBuilder.append("]]]");
                                        }
                                        choiceBuilder.append(',');
                                        string.setLength(0);
                                        state = 5;
                                        break;
                                    case ' ':
                                    case ',':
                                        if (string.length() > 0) {
                                            switch (state) {
                                                case 4:
                                                    choiceBuilder.append(',');
                                                case 3:
                                                    if (isNumber(string.toString()))
                                                        choiceBuilder.append(string);
                                                    else choiceBuilder.append('"').append(string).append('"');
                                                    string.setLength(0);
                                                    if (chr == ',') {
                                                        choiceBuilder.append("]]");
                                                        state = 2;
                                                    } else state = 4;
                                                    break;
                                                case 2:
                                                    choiceBuilder.append(',');
                                                case 1:
                                                    choiceBuilder.append("[\"").append(string.toString()).append("\",[");
                                                    string.setLength(0);
                                                    if (chr == ',') {
                                                        choiceBuilder.append("]]");
                                                        state = 2;
                                                    } else state = 3;
                                                    break;
                                                case 5:
                                                    string.append(chr);
                                            }
                                        }
                                        break;
                                    default:
                                        string.append(chr);
                                }
                            }
                            String[] splits = string.toString().split("//");
                            choiceBuilder.append("text:\"").append(splits[0].trim()
                                    .replace("\"", "\\\"")).append("\"");
                            if (splits.length > 1) {
                                choiceBuilder.append(",ifs:[");
                                for (int it = 1; it < splits.length; it++) {
                                    if (it != 1) choiceBuilder.append(',');
                                    choiceBuilder.append('"').append(splits[it].trim()).append('"');
                                }
                                choiceBuilder.append(']');
                            }
                            choiceBuilder.append('}');
                        } else if (sentence.charAt(0) == '<') {
                            if (requireComma) out.write(',');
                            requireComma = false;
                            className = sentence.substring(1);
                        } else if (sentence.charAt(sentence.length() - 1) == '>') {
                            requireComma = true;
                            if (className == null) throw new IOException(
                                    "Class: " + sentence.substring(0, sentence.length() - 1)
                                            + " has never been initialised");
                            else if (!className.equals(sentence.substring(0, sentence.length() - 1)))
                                throw new IOException("Class: " + sentence.substring(0, sentence.length() - 1)
                                        + " has no start");

                            out.write((className.replaceAll("[' ]", "_") + ':').getBytes());
                            if (isArray != null && isArray) out.write(('[' + classBuilder.toString() + ']').getBytes());
                            else out.write(('{' + classBuilder.toString() + '}').getBytes());
                            classBuilder.setLength(0);
                            className = null;
                            isArray = null;
                        } else if (((split = sentence.split(":")).length == 2
                                //in-case some idiot forgets to add a semicolon
                                || (split = sentence.split("\t")).length == 2)
                                && sentence.charAt(0) != '>') {
                            split[0] = split[0].trim();
                            split[1] = split[1].trim();
                            if (className != null) {
                                if (isArray == null) isArray = false;
                                else if (isArray) throw new IOException("Key value defined in array");
                                if (requireComma) classBuilder.append(',');
                                else requireComma = true;
                                if (isNumber(split[1]))
                                    classBuilder.append(split[0]).append(":").append(split[1]);
                                else classBuilder.append(split[0]).append(":\"")
                                        .append(split[1].replace("\"", "\\\""))
                                        .append("\"");
                            } else {
                                if (requireComma) out.write(',');
                                else requireComma = true;
                                //rooted key values can never be numbers in case they are Hex
                                out.write((split[0] + ":\"" + split[1]
                                        .replace("\"", "\\\"") + "\"").getBytes());
                            }
                        } else if (className != null) {
                            if (isArray == null) isArray = true;
                            else if (!isArray) {
                                //just fill in an empty key value if someone forgets to add a value
                                int semicolon = sentence.indexOf(':');
                                if (semicolon == -1) throw new IOException("Non key value defined in class");
                                else classBuilder.append(',')
                                        .append(sentence.substring(0, semicolon)
                                                .replace("\"", "\\\""))
                                        .append(":\"\"");
                                continue;
                            }
                            if (requireComma) classBuilder.append(',');
                            else requireComma = true;
                            if (isNumber(sentence)) classBuilder.append(sentence);
                            else classBuilder.append("\"").append(sentence).append("\"");
                        }
                    }
                } else builder.append((char) i);
            } while (i != -1);
            if (choiceArrayBuilder.length() > 0) {
                out.write((",cArr:[" + choiceArrayBuilder + "]").getBytes());
            }
            out.write('}');
            out.close();
            in.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private static boolean isNumber(String str) {
        for (char i : str.toCharArray()) if (!Character.isDigit(i)) return false;
        return true;
    }
}
