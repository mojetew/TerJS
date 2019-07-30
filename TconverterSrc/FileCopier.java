import java.io.*;
import java.nio.channels.FileChannel;

public class FileCopier extends Thread {
    private File in, out;

    FileCopier(File in, File out) {
        this.in = in;
        this.out = out;
        start();
    }

    @Override
    public void run() {
        try {
            FileChannel inChannel = new FileInputStream(in).getChannel();
            FileChannel outChannel = new FileOutputStream(out).getChannel();
            inChannel.transferTo(0, inChannel.size(), outChannel);
            inChannel.close();
            outChannel.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
