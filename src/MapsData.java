import java.io.*;

public class MapsData extends FileParser {

    public MapsData(File in, OutputStream out) throws FileNotFoundException {
        super(in, out);
    }

    @Override
    public void run() {
        try {
            out.write("$=[".getBytes());
            StringBuilder builder = new StringBuilder();
            int currVar = 0;
            for (int i; (i = in.read()) != -1; ) {
                if (i == '|') {
                    if (currVar++ == 0) out.write(("[" + builder + ",").getBytes());
                    else if (currVar == 4) {
                        //convert to numbers to save space
                        switch (builder.toString()) {
                            case "blip":
                                out.write('0');
                                break;
                            case "blip_named":
                                out.write('1');
                                break;
                            case "blip_place":
                                out.write('2');
                                break;
                            case "blip_encounter":
                                out.write('3');
                                break;
                            case "blip_special":
                                out.write('4');
                                break;
                            default:
                                System.err.println("I don't understand mapType: " + builder.toString());
                        }
                    } else out.write((builder + ",").getBytes());
                    builder = new StringBuilder();
                } else if (i == ']') {
                    currVar = 0;
                    if (!builder.toString().equals("no_name")) out.write((",\"" + builder + "\"").getBytes());
                    out.write("],".getBytes());
                    builder = new StringBuilder();
                } else if (i != '[') builder.append((char) i);
            }
            if (!builder.toString().equals("no_name")) out.write((",\"" + builder + "\"").getBytes());
            out.write("]]".getBytes());
            out.close();
            in.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
